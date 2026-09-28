const maxSourceSize = 30 * 1024 * 1024
const maxUploadSize = 512 * 1024

function decodeImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const image = new Image()
    image.onload = () => resolve({ image, url })
    image.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Image format is not supported by this browser'))
    }
    image.src = url
  })
}

function encodeJpeg(canvas, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('Image conversion failed')), 'image/jpeg', quality)
  })
}

export async function prepareAvatar(file) {
  if (!file || file.size < 1 || file.size > maxSourceSize) {
    throw new Error('Invalid avatar file')
  }

  const { image, url } = await decodeImage(file)
  try {
    const width = image.naturalWidth
    const height = image.naturalHeight
    if (!width || !height || width * height > 60_000_000) {
      throw new Error('Image dimensions are not supported')
    }
    const canvas = document.createElement('canvas')
    canvas.width = 256
    canvas.height = 256
    const context = canvas.getContext('2d')
    if (!context) throw new Error('Canvas unavailable')
    const side = Math.min(width, height)
    context.drawImage(image, (width - side) / 2, (height - side) / 2, side, side, 0, 0, 256, 256)

    for (const quality of [.84, .68, .5]) {
      const blob = await encodeJpeg(canvas, quality)
      if (blob.size <= maxUploadSize) {
        return new File([blob], 'avatar.jpg', { type: 'image/jpeg' })
      }
    }
    throw new Error('Avatar conversion failed')
  } finally {
    URL.revokeObjectURL(url)
  }
}

export function avatarDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(new Error('Avatar preview failed'))
    reader.readAsDataURL(file)
  })
}
