import type { RouteStop, TransportSegment } from '../../../types/tripRoute'
import type {
  AMapGlobal,
  AMapMapInstance,
  AMapMarkerInstance,
  AMapOverlayInstance,
} from '../../../services/map/amapLoader'
import { isExpectedCityLocation } from '../../../services/map/cityGeoFence'

interface MarkerRecord {
  marker: AMapMarkerInstance
  element: HTMLButtonElement
  stopId: string
}

function markerContent(stop: RouteStop, onSelect: (stopId: string) => void) {
  const root = document.createElement('button')
  root.type = 'button'
  root.className = 'route-map-marker'
  root.dataset.stopId = stop.id
  root.setAttribute('aria-label', `第 ${stop.order} 站，${stop.name}`)
  root.addEventListener('click', (event) => {
    event.stopPropagation()
    onSelect(stop.id)
  })

  if (stop.image) {
    const thumbnail = document.createElement('span')
    thumbnail.className = 'route-marker-thumbnail'
    thumbnail.style.setProperty('--thumbnail-x', `${stop.thumbnailOffset?.x ?? -30}px`)
    thumbnail.style.setProperty('--thumbnail-y', `${stop.thumbnailOffset?.y ?? -70}px`)
    const image = document.createElement('img')
    image.src = stop.image.url
    image.alt = stop.image.alt
    image.loading = 'lazy'
    image.addEventListener(
      'error',
      () => {
        const placeholder = document.createElement('span')
        placeholder.className = 'route-marker-image-placeholder'
        placeholder.textContent = stop.name.slice(0, 1)
        image.replaceWith(placeholder)
      },
      { once: true },
    )
    thumbnail.appendChild(image)
    root.appendChild(thumbnail)
  }

  const number = document.createElement('span')
  number.className = 'route-marker-number'
  number.textContent = String(stop.order)
  root.appendChild(number)
  return root
}

export class AMapAdapter {
  private readonly map: AMapMapInstance
  private markers: MarkerRecord[] = []
  private polylines: AMapOverlayInstance[] = []

  constructor(
    private readonly amap: AMapGlobal,
    private readonly container: HTMLElement,
  ) {
    this.map = new amap.Map(container, {
      viewMode: '2D',
      zoom: 13,
      mapStyle: 'amap://styles/whitesmoke',
      showLabel: true,
      features: ['bg', 'road', 'building', 'point'],
      resizeEnable: true,
    })
    this.map.on('zoomend', () => this.updateZoomTier())
    this.updateZoomTier()
  }

  renderRoute(
    stops: RouteStop[],
    segments: TransportSegment[],
    selectedStopId: string | undefined,
    onSelect: (stopId: string) => void,
  ) {
    this.clearRoute()
    const resolvedStops = stops.filter(
      (stop) =>
        stop.location && isExpectedCityLocation(stop.location, stop.city),
    )
    const stopById = new Map(resolvedStops.map((stop) => [stop.id, stop]))

    for (const segment of segments) {
      const from = stopById.get(segment.fromStopId)
      const to = stopById.get(segment.toStopId)
      if (!from?.location || !to?.location) continue
      const path = segment.path?.length
        ? segment.path.map((point) => [point.lng, point.lat])
        : [
            [from.location.lng, from.location.lat],
            [to.location.lng, to.location.lat],
          ]
      const outline = new this.amap.Polyline({
        map: this.map,
        path,
        strokeColor: '#FFFFFF',
        strokeOpacity: 0.92,
        strokeWeight: 7,
        lineJoin: 'round',
        lineCap: 'round',
        zIndex: 8,
      })
      const line = new this.amap.Polyline({
        map: this.map,
        path,
        strokeColor: '#1677FF',
        strokeOpacity: 0.96,
        strokeWeight: 4,
        lineJoin: 'round',
        lineCap: 'round',
        showDir: true,
        zIndex: 9,
      })
      outline.setMap(this.map)
      line.setMap(this.map)
      this.polylines.push(outline, line)
    }

    this.markers = resolvedStops.map((stop) => {
      const element = markerContent(stop, onSelect)
      const marker = new this.amap.Marker({
        map: this.map,
        position: [stop.location!.lng, stop.location!.lat],
        anchor: 'bottom-center',
        content: element,
        zIndex: stop.id === selectedStopId ? 130 : 120,
      })
      marker.setMap(this.map)
      return { marker, element, stopId: stop.id }
    })
    this.setSelected(selectedStopId)
  }

  setSelected(stopId: string | undefined) {
    this.markers.forEach(({ marker, element, stopId: markerStopId }) => {
      const selected = markerStopId === stopId
      element.classList.toggle('route-map-marker-selected', selected)
      element.setAttribute('aria-pressed', String(selected))
      marker.setzIndex?.(selected ? 130 : 120)
    })
  }

  fitRoute(bottomPadding = 86) {
    const overlays: AMapOverlayInstance[] = [
      ...this.polylines,
      ...this.markers.map(({ marker }) => marker),
    ]
    if (overlays.length > 0) {
      this.map.setFitView(overlays, false, [64, 58, bottomPadding, 58], 14.5)
    }
  }

  focusStop(stop: RouteStop, bottomPadding = 86, zoom = 16) {
    if (!stop.location || !isExpectedCityLocation(stop.location, stop.city)) return
    const marker = this.markers.find(({ stopId }) => stopId === stop.id)
    if (marker) {
      this.map.setFitView(
        [marker.marker],
        false,
        [58, 52, bottomPadding, 52],
        zoom,
      )
      return
    }
    this.map.setZoomAndCenter(
      zoom,
      [stop.location.lng, stop.location.lat],
      false,
      320,
    )
  }

  zoomIn() {
    this.map.setZoom(Math.min(this.map.getZoom() + 1, 19))
  }

  zoomOut() {
    this.map.setZoom(Math.max(this.map.getZoom() - 1, 10))
  }

  destroy() {
    this.clearRoute()
    this.map.destroy()
  }

  private updateZoomTier() {
    const zoom = this.map.getZoom()
    this.container.dataset.zoomTier = zoom < 13 ? 'far' : zoom < 14 ? 'medium' : 'near'
  }

  private clearRoute() {
    this.markers.forEach(({ marker }) => marker.setMap(null))
    this.polylines.forEach((polyline) => polyline.setMap(null))
    this.markers = []
    this.polylines = []
  }
}
