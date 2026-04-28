// export default function Footer() {
//   return (
//     <footer className="bg-gray-50 py-12">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <p className="text-center text-gray-500 text-sm">
//           Made with <span className="font-semibold text-gray-700">Love ❤️</span>
//         </p>
//       </div>
//     </footer>
//   );
// }

import BgGradient from "@/components/common/bg-gradient";

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-gray-50 border-t">
      <BgGradient className="opacity-25" />

      <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="text-center sm:text-left">
            <h3 className="text-lg font-semibold text-gray-900">Sumify</h3>
            <p className="mt-1 text-sm text-gray-500">
              AI-powered PDF summaries in a visual reel format
            </p>
          </div>

          <nav className="flex gap-6 text-sm text-gray-500">
            <a href="#" className="hover:text-gray-900 transition">
              Features
            </a>
            <a href="#" className="hover:text-gray-900 transition">
              Pricing
            </a>
            <a href="#" className="hover:text-gray-900 transition">
              Privacy
            </a>
            <a href="#" className="hover:text-gray-900 transition">
              Contact
            </a>
          </nav>
        </div>

        <div className="mt-8 border-t pt-6 text-center">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} Sumify. Made with{" "}
            <span className="font-medium text-gray-700">Love ❤️</span>
          </p>
        </div>
      </div>
    </footer>
  );
}