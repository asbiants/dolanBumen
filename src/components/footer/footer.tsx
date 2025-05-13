import React from 'react'

const Footer = () => {
  return (
  <footer className="bg-[#1A2530] text-white py-12 px-4 md:px-32 mt-16">
    <div className="flex flex-col items-center">
      <div className="bg-white text-black rounded-md px-8 py-4 mb-4 font-semibold">Logo Website</div>
      <p className="mb-4 text-center">Portal dan Layanan Informasi Pariwisata Kabupaten Kebumen</p>
      <div className="flex gap-4 mb-4">
        <span className="text-2xl">ⓕ</span>
        <span className="text-2xl">ⓧ</span>
        <span className="text-2xl">ⓣ</span>
      </div>
      <p className="text-xs">©2025 Copyright By Dolan Bumen</p>
    </div>
  </footer>
  )
}

export default Footer