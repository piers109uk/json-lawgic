import Script from "next/script"

export default function Analytics() {
  return (
    <>
      <Script defer src="https://cloud.umami.is/script.js" data-website-id="f79a01cb-327b-4f2d-8e07-0efa24f6b15a" />
    </>
  )
}
