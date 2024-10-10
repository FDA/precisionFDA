import { CollisionDetection, rectIntersection } from '@dnd-kit/core'

// https://github.com/clauderic/dnd-kit/pull/334#issuecomment-1965708784
export const centerToCursorCollisionDetection: CollisionDetection = (args) => {
  // Bail out if keyboard activated
  if (!args.pointerCoordinates) {
    return rectIntersection(args)
  }
  const { x, y } = args.pointerCoordinates
  const { width, height } = args.collisionRect
  const updated = {
    ...args,
    // The collision rectangle is broken when using snapCenterToCursor. Reset
    // the collision rectangle based on pointer location and overlay size.
    collisionRect: {
      width,
      height,
      bottom: y + height / 2,
      left: x - width / 2,
      right: x + width / 2,
      top: y - height / 2,
    },
  }
  return rectIntersection(updated)
}
