'use client';

const Footer = () => {
  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-3 flex justify-center">
          <p className="text-xs sm:text-sm text-gray-400 text-center">
            © {new Date().getFullYear()} Sistema de Gestión Financiera. Todos los derechos reservados - CIISIC - SISGEFI-DK
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
