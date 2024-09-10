import { Streamlit, RenderData } from "streamlit-component-lib"

function onRender(event: Event): void {
  const data = (event as CustomEvent<RenderData>).detail

  // Remove existing content
  let child = document.body.lastElementChild;
  if (child) {
    document.body.removeChild(child)
  }

  // Add and style the image container
  let div = document.body.appendChild(document.createElement("div"))
  for (let key in data.args["div_style"]) {
    div.style[key as any] = data.args["div_style"][key]
  }

  let imagesLoaded = 0

  // Debounce or throttle function to optimize IntersectionObserver callback
  function debounce(fn, delay) {
    let timer;
    return function(...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  }

  // Intersection Observer for lazy loading
  const observer = new IntersectionObserver(
    debounce((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement
          img.src = img.getAttribute("data-src")!
          observer.unobserve(img)  // Stop observing once loaded
        }
      })
    }, 100), // Debounce with 100ms delay
    {
      root: null,
      rootMargin: "0px",
      threshold: 0.1
    }
  )

  // Add and style all images
  for (let i = 0; i < data.args["paths"].length; i++) {
    let img = div.appendChild(document.createElement("img"))
    for (let key in data.args["img_style"]) {
      img.style[key as any] = data.args["img_style"][key]
    }

    img.setAttribute("data-src", data.args["paths"][i])  // Use data-src for lazy loading
    if (data.args["titles"].length > i) {
      img.title = data.args["titles"][i]
    }
    img.onclick = function (): void {
      Streamlit.setComponentValue(i)
    }

    observer.observe(img)  // Start observing the image for lazy loading

    img.onload = function (): void {
      imagesLoaded++
      if (imagesLoaded === data.args["paths"].length) {
        Streamlit.setFrameHeight()
      }
    }
  }
}

Streamlit.events.addEventListener(Streamlit.RENDER_EVENT, onRender)
Streamlit.setComponentReady()
