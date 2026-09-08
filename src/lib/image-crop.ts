/**
 * ============================================================================
 * CROPPING AND SHRINKING A PHOTOGRAPH BEFORE IT IS UPLOADED
 * ----------------------------------------------------------------------------
 * Two problems, one answer.
 *
 * THE SHAPE
 *   The catalogue card is 3:4 and the product page is a square, both drawn
 *   with `object-cover`, which crops from the middle and asks nobody. A wide
 *   photograph of a sofa loses its arms; a tall one loses its legs. The office
 *   could not see it happening and could not choose differently.
 *
 * THE WEIGHT
 *   Nothing resized anything. A 4MB photograph straight off a phone was stored
 *   at 4MB and sent to every visitor at 4MB, to be drawn in a box 280px wide.
 *
 * So the picture is cropped to a known shape with the office choosing what
 * stays, and written out at a size that matches how it is actually displayed.
 *
 * WHY IT HAPPENS IN THE BROWSER
 *   The alternative is uploading the original and resizing on a server, which
 *   needs a server, and means the slow upload happens first and the saving
 *   comes later. Here the 4MB never leaves the machine: the file that goes up
 *   is the finished one, so a phone on showroom wifi uploads 250KB instead.
 * ============================================================================
 */

/** The catalogue card's shape, which is the surface most people browse. */
export const PRODUCT_ASPECT = 3 / 4

/**
 * The long edge of what gets stored.
 *
 * A card is about 280px wide in a three-column grid and the product page is
 * about 600px; doubled for a high-density screen that is 1200. Anything beyond
 * this is bytes that no display can show.
 */
export const OUTPUT_MAX_WIDTH = 1200

/**
 * WebP at 82.
 *
 * Photographs, not line art: at 82 the difference from the original is not
 * visible on a photograph of furniture, and the file is roughly a quarter of
 * the JPEG. Every browser that can run this app can display it.
 */
const OUTPUT_TYPE = 'image/webp'
const OUTPUT_QUALITY = 0.82

/** How far from the target shape a picture may be before it is worth cropping. */
const ASPECT_TOLERANCE = 0.02

export interface CropBox {
  /** Source pixels. The rectangle of the original that survives. */
  x: number
  y: number
  width: number
  height: number
}

/** Reads a file into an <img>, so its real dimensions can be measured. */
export function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const image = new Image()

    image.onload = () => {
      // The bitmap is decoded and held by the element; the URL has done its
      // job. Not revoking it leaks the whole file for the life of the tab.
      URL.revokeObjectURL(url)
      resolve(image)
    }
    image.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Could not read that image'))
    }

    image.src = url
  })
}

/**
 * Whether this picture can be uploaded untouched.
 *
 * Two ways to fail: the wrong shape, or bigger than anything can display. A
 * picture that is already 3:4 and already small is passed through — running it
 * through the canvas anyway would re-encode it for no reason, which loses a
 * little quality every time somebody re-saves a product.
 */
export function needsWork(
  image: HTMLImageElement,
  aspect = PRODUCT_ASPECT,
): { crop: boolean; shrink: boolean } {
  const actual = image.naturalWidth / image.naturalHeight
  return {
    crop: Math.abs(actual - aspect) > ASPECT_TOLERANCE,
    shrink: image.naturalWidth > OUTPUT_MAX_WIDTH,
  }
}

/**
 * The largest box of the right shape, centred — where the cropper opens.
 *
 * Centre is the honest default because it is what `object-cover` was already
 * doing silently. The difference is that it can now be moved.
 */
export function centredCrop(image: HTMLImageElement, aspect = PRODUCT_ASPECT): CropBox {
  const { naturalWidth: w, naturalHeight: h } = image

  // Too wide for the target shape, so height is the limit and the sides go.
  if (w / h > aspect) {
    const width = Math.round(h * aspect)
    return { x: Math.round((w - width) / 2), y: 0, width, height: h }
  }

  const height = Math.round(w / aspect)
  return { x: 0, y: Math.round((h - height) / 2), width: w, height }
}

/**
 * Keeps a box inside the picture.
 *
 * Called on every pointer move while dragging, so it has to be cheap and it
 * has to be total: there is no valid "slightly outside" state to recover from
 * later, and a box that escapes produces transparent edges in the output.
 */
export function clampCrop(image: HTMLImageElement, box: CropBox): CropBox {
  const width = Math.min(box.width, image.naturalWidth)
  const height = Math.min(box.height, image.naturalHeight)

  return {
    width,
    height,
    x: Math.min(Math.max(0, box.x), image.naturalWidth - width),
    y: Math.min(Math.max(0, box.y), image.naturalHeight - height),
  }
}

/**
 * Draws the chosen rectangle out to a file.
 *
 * The output is capped at OUTPUT_MAX_WIDTH but never enlarged: a small picture
 * stays small rather than being blown up into a blurry big one. `imageSmoothingQuality`
 * is set high because the browser's default when shrinking by 4x or more is
 * visibly rough on the straight edges furniture is full of.
 */
export async function renderCrop(
  image: HTMLImageElement,
  box: CropBox,
  name: string,
): Promise<File> {
  const scale = Math.min(1, OUTPUT_MAX_WIDTH / box.width)
  const width = Math.round(box.width * scale)
  const height = Math.round(box.height * scale)

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height

  const context = canvas.getContext('2d')
  if (!context) throw new Error('Could not prepare the image')

  context.imageSmoothingEnabled = true
  context.imageSmoothingQuality = 'high'
  context.drawImage(image, box.x, box.y, box.width, box.height, 0, 0, width, height)

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, OUTPUT_TYPE, OUTPUT_QUALITY),
  )
  if (!blob) throw new Error('Could not prepare the image')

  return new File([blob], toWebpName(name), { type: OUTPUT_TYPE })
}

/** `sofa.jpg` becomes `sofa.webp`, so the stored name matches the contents. */
function toWebpName(name: string): string {
  const stem = name.replace(/\.[^.]+$/, '')
  return `${stem || 'image'}.webp`
}
