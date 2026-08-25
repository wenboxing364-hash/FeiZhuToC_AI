import { ImageIcon } from 'lucide-react'
import { useState } from 'react'

interface AttractionThumbnailProps {
  src?: string
  alt: string
  onClick?: () => void
}

const frameClassName =
  'h-[72px] w-[88px] shrink-0 overflow-hidden rounded-[10px] bg-[#F3F6FA] max-[380px]:h-[64px] max-[380px]:w-[76px]'

export function AttractionThumbnail({ src, alt, onClick }: AttractionThumbnailProps) {
  const [failedSrc, setFailedSrc] = useState<string>()
  const hasError = Boolean(src && failedSrc === src)

  const content =
    src && !hasError ? (
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        className="h-full w-full object-cover"
        onError={() => setFailedSrc(src)}
      />
    ) : (
      <span
        className="flex h-full w-full items-center justify-center text-[#B7C0CC]"
        role="img"
        aria-label={`${alt}暂无图片`}
      >
        <ImageIcon size={22} strokeWidth={1.6} aria-hidden="true" />
      </span>
    )

  if (!onClick) return <div className={frameClassName}>{content}</div>

  return (
    <button
      type="button"
      className={`${frameClassName} transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1677FF]`}
      aria-label={`查看${alt}`}
      onClick={onClick}
    >
      {content}
    </button>
  )
}
