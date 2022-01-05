import { useRef, useCallback } from 'react'

const isSafari = () => {
  const ua = navigator.userAgent.toLowerCase()
  return ua.indexOf('safari') > -1 && ua.indexOf('chrome') < 0
}

function useMuteWithRefCallback() {
  const ref = useRef(null)
  const setRef = useCallback((node) => {
    // Save a reference to the node
    ref.current = node

    if (isSafari() && ref.current) {
      // obtain reference to the video element
      const player = ref.current.image
      // if the reference to video player has been obtained
      if (player) {
        console.log(player)
        // set the video attributes using javascript as per the
        // webkit Policy
        player.controls = false
        player.playsinline = true
        player.muted = true
        player.setAttribute('muted', '') // leave no stones unturned :)
        player.autoplay = true

        // Let's wait for an event loop tick and be async.
        setTimeout(() => {
          // player.play() might return a promise but it's not guaranteed crossbrowser.
          const promise = player.play()
          // let's play safe to ensure that if we do have a promise
          if (promise.then) {
            promise
              .then(() => {})
              .catch(() => {
                // if promise fails, hide the video and fallback to <img> tag
                ref.current.style.display = 'none'
                setShouldUseImage(true)
              })
          }
        }, 0)
      }
    }
  }, [])

  return [setRef]
}

export default useMuteWithRefCallback