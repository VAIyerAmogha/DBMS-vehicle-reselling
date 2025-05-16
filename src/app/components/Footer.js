// src/app/components/Footer.js
export default function Footer() {
  return (
    <footer className="bg-gray-100 text-center p-4 mt-12">
      <p className="text-sm text-gray-600">
        &copy; {new Date().getFullYear()} Vehicle Reselling Platform
      </p>
    </footer>
  );
}
