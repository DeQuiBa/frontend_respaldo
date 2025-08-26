'use client';
import React, { useState, useEffect } from 'react';
import Button from '@/components/iu/button';
import { Search, ArrowRight} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/navbar/header';
import Footer from '@/components/footer/footer';

export default function Home() {
  const [isVisible, setIsVisible] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setIsVisible(true);
    
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 relative overflow-hidden">
      {/* Fondo técnico animado */}
      <div className="absolute inset-0">
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            background: `
              radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(59, 130, 246, 0.15) 0%, transparent 50%),
              linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)
            `
          }}
        />
        
        {/* Patrones geométricos */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-96 h-96 border border-blue-500/30 rotate-45 animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-64 h-64 border border-cyan-500/30 rotate-12 animate-bounce"></div>
          <div className="absolute top-1/2 left-1/4 w-32 h-32 border-2 border-purple-500/40 rounded-full animate-spin"></div>
        </div>

        {/* Grid técnico */}
        <div 
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `
              linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}
        />
      </div>

      <Header />
      
      <main className="pt-16 relative z-10">
        {/* Hero Section */}
        <section className="relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-24">
            <div className="text-center">
              {/* Logo con efecto holográfico */}
              <div className={`relative transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full blur-xl opacity-30 animate-pulse"></div>
                <Image 
                  src="/images/logo.webp" 
                  alt="Logo de La Clínica Dental" 
                  width={300} 
                  height={100}
                  className="mx-auto h-28 sm:h-32 md:h-40 w-auto transition-all duration-500 hover:scale-110 hover:drop-shadow-2xl relative z-10" 
                  priority 
                  style={{   
                    filter: 'drop-shadow(0 8px 32px rgba(59, 130, 246, 0.3))',
                  }}
                />
              </div>

              {/* Título con efecto de máquina de escribir */}
              <div className={`mt-8 transform transition-all duration-1000 delay-300 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                <h1 className="text-3xl sm:text-4xl md:text-6xl font-black tracking-tight">
                  <span className="block bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-500 bg-clip-text text-transparent animate-pulse">
                    BIENVENIDO A
                  </span>
                  <span className="block text-white mt-2 relative">
                    EL SISTEMA DE GESTIÓN FINANCIERA
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse"></div>
                  </span>
                </h1>
              </div>

              {/* Descripción con efecto de aparición */}
              <div className={`mt-6 transform transition-all duration-1000 delay-500 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                <p className="max-w-2xl mx-auto text-lg md:text-xl text-gray-300 leading-relaxed">
                  <span className="text-cyan-400 font-semibold">Gestión</span> de 
                  <span className="text-blue-400 font-semibold"> ingresos</span> y
                  <span className="text-white font-semibold"> egresos</span>
                </p>
              </div>

              {/* Botones de acción rediseñados */}
              <div className={`mt-10 transform transition-all duration-1000 delay-700 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                <div className="flex flex-col sm:flex-row justify-center gap-6">

                  
                  <Link href="/findAppointment">
                    <div className="group relative">
                      <div className="absolute -inset-1 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-xl blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                      <Button 
                        size="lg" 
                        className="relative bg-transparent hover:bg-gradient-to-r hover:from-cyan-600 hover:to-blue-600 text-cyan-400 hover:text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl border-2 border-cyan-500/50"
                      >
                        <Search className="mr-3 w-5 h-5" />
                        BUSCAR CÓDIGO
                        <ArrowRight className="ml-3 w-5 h-5 transform group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <Footer />
        </div>
      </main>
    </div>
  );
}