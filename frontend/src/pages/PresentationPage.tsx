import { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../lib/api';
import '../styles/reforma-styles.css';

interface BeforeAfterSliderProps {
  beforeImage: string;
  afterImage: string;
}

function BeforeAfterSlider({ beforeImage, afterImage }: BeforeAfterSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = Math.max(0, Math.min((x / rect.width) * 100, 100));

    setSliderPosition(percent);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    handleMove(e.clientX);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    handleMove(e.touches[0].clientX);
  };

  const handleStart = () => setIsDragging(true);
  const handleEnd = () => setIsDragging(false);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleEnd);
      document.addEventListener('touchmove', handleTouchMove);
      document.addEventListener('touchend', handleEnd);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleEnd);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleEnd);
      };
    }
  }, [isDragging]);

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-[16/9] overflow-hidden rounded-none shadow-premium cursor-ew-resize select-none"
      onMouseDown={handleStart}
      onTouchStart={handleStart}
    >
      {/* After Image (Background) */}
      <img
        src={afterImage}
        alt="Después"
        className="absolute inset-0 w-full h-full object-cover"
        draggable={false}
        onError={(e) => {
          console.error('Failed to load after image:', afterImage);
          e.currentTarget.style.display = 'none';
        }}
      />

      {/* Before Image (Clipped) */}
      <div
        className="absolute inset-0 w-full h-full overflow-hidden"
        style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
      >
        <img
          src={beforeImage}
          alt="Antes"
          className="absolute inset-0 w-full h-full object-cover"
          draggable={false}
          onError={(e) => {
            console.error('Failed to load before image:', beforeImage);
            e.currentTarget.style.display = 'none';
          }}
        />
      </div>

      {/* Slider Handle - Minimal */}
      <div
        className="absolute top-0 bottom-0 w-[1px] bg-minimal-black cursor-ew-resize"
        style={{ left: `${sliderPosition}%` }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-minimal-white border border-minimal-black flex items-center justify-center">
          <svg className="w-5 h-5 text-minimal-black" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
          </svg>
        </div>
      </div>

      {/* Labels - Minimal */}
      <div className="absolute top-4 left-4 bg-minimal-white px-4 py-2 border border-minimal-lightgray">
        <span className="text-xs font-sans font-normal text-minimal-black uppercase tracking-wide">Antes</span>
      </div>
      <div className="absolute top-4 right-4 bg-minimal-black px-4 py-2">
        <span className="text-xs font-sans font-normal text-minimal-white uppercase tracking-wide">Después</span>
      </div>
    </div>
  );
}

export default function PresentationPage() {
  const { token } = useParams();
  const [selectedPair, setSelectedPair] = useState(0);
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCopiedNotification, setShowCopiedNotification] = useState(false);

  useEffect(() => {
    const fetchProject = async () => {
      if (!token) {
        setError('Token de presentación no válido');
        setLoading(false);
        return;
      }

      try {
        const res = await api.get(`/presentations/${token}`);
        console.log('Project data:', res.data.data);
        setProject(res.data.data);

        try {
          await api.post(`/presentations/${token}/analytics`, {
            eventType: 'VIEW'
          });
        } catch (analyticsError) {
          console.error('Failed to track analytics:', analyticsError);
        }

        setLoading(false);
      } catch (err: any) {
        console.error('Failed to load presentation:', err);
        setError(err.response?.data?.message || 'No se pudo cargar la presentación');
        setLoading(false);
      }
    };

    fetchProject();
  }, [token]);

  if (loading) {
    return (
      <div className="page flex items-center justify-center px-4">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-minimal-white mb-10 border border-minimal-lightgray">
            <svg className="animate-spin w-12 h-12 text-minimal-black" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
          <h3 className="section-title-serif mb-3">Cargando presentación</h3>
          <p className="text-small">Por favor espera un momento</p>
        </div>
      </div>
    );
  }

  if (error || !project || !project.beforeImages || !project.afterImages ||
      project.beforeImages.length === 0 || project.afterImages.length === 0) {
    return (
      <div className="page flex items-center justify-center p-4">
        <div className="text-center max-w-lg content-box">
          <div className="w-24 h-24 bg-natural-100 mx-auto mb-10 flex items-center justify-center border border-natural-200">
            <svg className="w-12 h-12 text-natural-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="section-title-serif mb-4">Presentación no encontrada</h3>
          <p className="text-body mb-10">{error || 'Esta presentación no existe o ha sido eliminada.'}</p>
          <a
            href="/login"
            className="btn-primary inline-block"
          >
            Volver al inicio
          </a>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long' });
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long' });
      }
      return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'long' });
    } catch {
      return new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long' });
    }
  };

  const handleShareLink = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setShowCopiedNotification(true);

      // Track share event
      await api.post(`/presentations/${token}/analytics`, {
        eventType: 'SHARE'
      });

      // Hide notification after 3 seconds
      setTimeout(() => {
        setShowCopiedNotification(false);
      }, 3000);
    } catch (err) {
      console.error('Failed to copy link:', err);
      // Fallback: show alert with link
      alert(`Link de la presentación:\n${url}`);
    }
  };

  return (
    <div className="page">
      {/* Print styles */}
      <style>{`
        /* Logo positioning */
        .logo-header {
          display: block;
        }

        .logo-print-corner {
          display: none;
        }

        @media print {
          @page {
            size: A4;
            margin: 0;
          }

          * {
            print-color-adjust: exact !important;
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
          }

          html, body {
            margin: 0 !important;
            padding: 0 !important;
            print-color-adjust: exact !important;
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
          }

          .page {
            background-color: #b8c4a9 !important;
            print-color-adjust: exact !important;
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
          }

          /* Hide logo in header, show in corner when printing */
          .logo-header {
            display: none !important;
          }

          .logo-print-corner {
            display: block !important;
          }

          main {
            max-width: 100% !important;
            padding-left: 2rem !important;
            padding-right: 2rem !important;
            padding-top: 2rem !important;
          }

          /* Prevent page breaks inside important sections */
          .no-break {
            page-break-inside: avoid;
            break-inside: avoid;
          }

          /* Hide interactive elements */
          button, .no-print, .thumbnail-selector {
            display: none !important;
          }

          /* Show print-only elements */
          .print-only {
            display: block !important;
          }

          /* Make header static for print */
          header {
            position: static !important;
            page-break-after: avoid;
            background-color: #b8c4a9 !important;
            print-color-adjust: exact !important;
            -webkit-print-color-adjust: exact !important;
          }

          /* Reducir padding de containers blancos para evitar espacios */
          .content-box-large {
            padding: 1.5rem !important;
            margin-bottom: 0 !important;
            padding-bottom: 3rem !important;
          }

          .gallery-container {
            padding: 1.5rem !important;
          }

          /* Reducir márgenes internos */
          .mb-10 {
            margin-bottom: 1rem !important;
          }

          .mb-12 {
            margin-bottom: 1.5rem !important;
          }

          .mb-20 {
            margin-bottom: 2rem !important;
          }

          /* Compactar grid de galería */
          .gallery-grid {
            gap: 0.5rem !important;
          }

          /* Secciones que empiezan nueva página - espacio verde arriba */
          .gallery-section,
          .description-section,
          .slider-section:first-child {
            padding-top: 3rem !important;
          }

          .gallery-section .section-title-serif,
          .description-section .section-title-serif {
            margin-top: 0 !important;
          }

          /* Hero section primera página también necesita espacio */
          .mb-12:first-child,
          .mb-16:first-child {
            padding-top: 2rem !important;
          }

          /* Ensure images print correctly */
          img {
            max-width: 100%;
            page-break-inside: avoid;
          }

          /* Gallery items - allow breaks between items but not inside */
          .gallery-item {
            page-break-inside: avoid;
            break-inside: avoid;
            margin-bottom: 1cm;
          }

          /* Gallery grid - allow natural breaks between rows */
          .gallery-grid {
            display: grid !important;
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 1cm !important;
            page-break-inside: auto;
            break-inside: auto;
          }

          /* Gallery section headers */
          .gallery-header {
            page-break-after: avoid;
            break-after: avoid;
          }

          /* Force page break before gallery section */
          .gallery-section {
            page-break-before: always;
            break-before: always;
          }

          /* Before/After slider - keep together */
          .slider-section {
            page-break-inside: avoid;
            break-inside: avoid;
            page-break-after: always;
            break-after: always;
          }

          /* Description section */
          .description-section {
            page-break-inside: avoid;
            break-inside: avoid;
            page-break-after: always;
            break-after: always;
            margin-bottom: 0 !important;
          }

          /* Stats section también termina página */
          .content-box-large:has(+ .gallery-section) {
            page-break-after: always;
            break-after: always;
            margin-bottom: 0 !important;
          }

          /* Ensure first gallery doesn't break with its header */
          .gallery-header + .gallery-grid {
            page-break-before: avoid;
            break-before: avoid;
          }

          /* Footer on last page */
          footer {
            page-break-before: auto;
            margin-top: 2cm;
          }
        }
      `}</style>

      {/* Header */}
      <header className="header">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="logo">Abu24.</h1>
              <img
                src="/LogoABU.jpg"
                alt="24 horas"
                className="w-12 h-12 object-contain opacity-90 logo-header"
              />
            </div>
            <div className="flex items-center gap-3 no-print">
              <button
                onClick={handleShareLink}
                className="px-4 py-2 bg-white text-minimal-black border border-minimal-lightgray hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm font-medium rounded-md shadow-soft"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                <span>Compartir Link</span>
              </button>
              <button
                onClick={() => window.print()}
                className="btn-primary flex items-center space-x-2"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                <span>Descargar PDF</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Copied Notification */}
      {showCopiedNotification && (
        <div className="fixed top-24 right-8 z-50 animate-fadeIn no-print">
          <div className="bg-minimal-black text-minimal-white px-6 py-3 rounded-md shadow-lg flex items-center gap-3">
            <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <span className="font-medium">Link copiado al portapapeles</span>
          </div>
        </div>
      )}

      {/* Corner Logo - Only visible when printing */}
      <div className="fixed top-2 right-6 z-40 logo-print-corner">
        <img
          src="/LogoABU.jpg"
          alt="24 horas"
          className="w-16 h-16 object-contain opacity-90"
        />
      </div>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-8 sm:px-12 md:px-16 lg:px-20 pt-16 md:pt-20 pb-0">
        {/* Hero Section */}
        <div className="mb-12 md:mb-16">
          <h2 className="title-mixed mb-8">
            <span className="sans">Reforma </span>
            <span className="serif">{project.title}</span>
          </h2>
          <div className="divider mb-6"></div>
          <div className="location-date">
            {project.location && (
              <>
                <span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {project.location}
                </span>
                <span>•</span>
              </>
            )}
            <span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {formatDate(project.completedAt)}
            </span>
            {project.storeCode && (
              <>
                <span>•</span>
                <span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" />
                  </svg>
                  {project.storeCode}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Before/After Comparison */}
        <div className="mb-section slider-section">
          <div className="mb-10">
            <h3 className="section-title-serif">
              Transformación
            </h3>
            <div className="divider-short"></div>
          </div>

          {/* Container blanco con padding GRANDE uniforme - Efecto marco de galería */}
          <div className="image-container">
            <BeforeAfterSlider
              beforeImage={project.beforeImages[selectedPair]?.url || ''}
              afterImage={project.afterImages[selectedPair]?.url || ''}
            />
          </div>

          {/* Thumbnail Selector */}
          {project.beforeImages.length > 1 && (
            <div className="mt-6 flex justify-center space-x-3 overflow-x-auto pb-4 thumbnail-selector">
              {project.beforeImages.map((_: any, index: number) => (
                <button
                  key={index}
                  onClick={() => setSelectedPair(index)}
                  className={`
                    relative flex-shrink-0 w-20 h-20 overflow-hidden transition-all duration-200
                    ${selectedPair === index
                      ? 'opacity-100 border-2 border-minimal-black'
                      : 'opacity-40 border border-minimal-lightgray hover:opacity-70'
                    }
                  `}
                >
                  <img
                    src={project.afterImages[index]?.url || ''}
                    alt={`Vista ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Description Section */}
        <div className="content-box-large description-section">
          <div className="mb-10">
            <h3 className="section-title-serif">
              Detalles del Proyecto
            </h3>
            <div className="divider-short"></div>
          </div>

          {/* Texto principal */}
          <div className="max-w-3xl mb-12">
            <div className="text-body whitespace-pre-line">
              {project.descriptionEnhanced || project.descriptionOriginal}
            </div>
          </div>

          {/* Datos clave */}
          <div className="data-grid">
            <div className="data-item">
              <div className="data-label">Ubicación</div>
              <div className="data-value">{project.location || 'No especificada'}</div>
            </div>
            <div className="data-item">
              <div className="data-label">Finalización</div>
              <div className="data-value">{formatDate(project.completedAt)}</div>
            </div>
            <div className="data-item">
              <div className="data-label">Estado</div>
              <div className="data-value">Completado</div>
            </div>
          </div>
        </div>

        {/* Delivery Note Section (Albarán) */}
        {project.deliveryNotes && project.deliveryNotes.length > 0 && (
          <div className="content-box-large">
            <div className="mb-10">
              <h3 className="section-title-serif">
                Albarán
              </h3>
              <div className="divider-short"></div>
            </div>

            <div className={`grid ${project.deliveryNotes.length === 1 ? 'grid-cols-1 max-w-2xl mx-auto' : 'grid-cols-1 md:grid-cols-2'} gap-6`}>
              {project.deliveryNotes.map((note: any) => (
                <div key={note.id} className="relative overflow-hidden rounded-none border border-minimal-lightgray">
                  <img
                    src={note.imageUrl}
                    alt="Albarán"
                    className="w-full h-auto object-contain"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Budget Section (Presupuesto) */}
        {project.budgets && project.budgets.length > 0 && (
          <div className="content-box-large">
            <div className="mb-10">
              <h3 className="section-title-serif">
                Presupuesto
              </h3>
              <div className="divider-short"></div>
            </div>

            <div className="space-y-4">
              {project.budgets.map((budget: any, index: number) => {
                const isPdf = budget.imageUrl.endsWith('.pdf');

                if (isPdf) {
                  // PDF layout - similar to technical sheets
                  return (
                    <div key={budget.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 border border-minimal-lightgray bg-minimal-white hover:bg-gray-50 transition-colors no-print">
                      <div className="flex-shrink-0 w-10 h-10 bg-minimal-black text-minimal-white flex items-center justify-center font-sans font-semibold text-sm">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-sans font-medium text-minimal-black">Presupuesto</p>
                        <p className="text-xs text-gray-500 mt-1 break-all">{budget.fileName}</p>
                      </div>
                      <a
                        href={budget.imageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full sm:w-auto flex-shrink-0 px-4 py-2 bg-minimal-black text-minimal-white font-sans text-sm hover:bg-gray-800 transition-colors text-center"
                      >
                        Ver documento →
                      </a>
                    </div>
                  );
                } else {
                  // Image layout - original style
                  return (
                    <div key={budget.id} className="relative overflow-hidden rounded-none border border-minimal-lightgray">
                      <img
                        src={budget.imageUrl}
                        alt="Presupuesto"
                        className="w-full h-auto object-contain"
                      />
                      <div className="no-print absolute bottom-0 left-0 right-0 bg-gradient-to-t from-minimal-black/80 to-transparent p-4">
                        <a
                          href={budget.imageUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-minimal-white text-minimal-black text-sm font-medium hover:bg-gray-100 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <span>Ver documento</span>
                        </a>
                      </div>
                    </div>
                  );
                }
              })}

              {/* Print-only version for PDFs */}
              <div className="print-only space-y-2 mt-6">
                {project.budgets.filter((budget: any) => budget.imageUrl.endsWith('.pdf')).map((budget: any, index: number) => (
                  <div key={budget.id} className="flex items-baseline gap-2">
                    <span className="font-sans font-medium text-minimal-black">{index + 1}.</span>
                    <span className="font-sans text-minimal-black">Presupuesto</span>
                    <span className="text-gray-600 text-sm">— Ver documento</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Electronic Invoice Section (Factura Electrónica) */}
        {project.electronicInvoices && project.electronicInvoices.length > 0 && (
          <div className="content-box-large">
            <div className="mb-10">
              <h3 className="section-title-serif">
                Factura Electrónica
              </h3>
              <div className="divider-short"></div>
            </div>

            <div className="space-y-4">
              {project.electronicInvoices.map((invoice: any, index: number) => {
                const isPdf = invoice.imageUrl.endsWith('.pdf');

                if (isPdf) {
                  // PDF layout - similar to technical sheets
                  return (
                    <div key={invoice.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 border border-minimal-lightgray bg-minimal-white hover:bg-gray-50 transition-colors no-print">
                      <div className="flex-shrink-0 w-10 h-10 bg-minimal-black text-minimal-white flex items-center justify-center font-sans font-semibold text-sm">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-sans font-medium text-minimal-black">Factura Electrónica</p>
                        <p className="text-xs text-gray-500 mt-1 break-all">{invoice.fileName}</p>
                      </div>
                      <a
                        href={invoice.imageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full sm:w-auto flex-shrink-0 px-4 py-2 bg-minimal-black text-minimal-white font-sans text-sm hover:bg-gray-800 transition-colors text-center"
                      >
                        Ver documento →
                      </a>
                    </div>
                  );
                } else {
                  // Image layout - original style
                  return (
                    <div key={invoice.id} className="relative overflow-hidden rounded-none border border-minimal-lightgray">
                      <img
                        src={invoice.imageUrl}
                        alt="Factura Electrónica"
                        className="w-full h-auto object-contain"
                      />
                      <div className="no-print absolute bottom-0 left-0 right-0 bg-gradient-to-t from-minimal-black/80 to-transparent p-4">
                        <a
                          href={invoice.imageUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-minimal-white text-minimal-black text-sm font-medium hover:bg-gray-100 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <span>Ver documento</span>
                        </a>
                      </div>
                    </div>
                  );
                }
              })}

              {/* Print-only version for PDFs */}
              <div className="print-only space-y-2 mt-6">
                {project.electronicInvoices.filter((invoice: any) => invoice.imageUrl.endsWith('.pdf')).map((invoice: any, index: number) => (
                  <div key={invoice.id} className="flex items-baseline gap-2">
                    <span className="font-sans font-medium text-minimal-black">{index + 1}.</span>
                    <span className="font-sans text-minimal-black">Factura Electrónica</span>
                    <span className="text-gray-600 text-sm">— Ver documento</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Technical Sheets Section (Fichas Técnicas) */}
        {project.technicalSheets && project.technicalSheets.length > 0 && (
          <div className="content-box-large">
            <div className="mb-10">
              <h3 className="section-title-serif">
                Fichas Técnicas de Productos
              </h3>
              <div className="divider-short"></div>
            </div>

            <div className="space-y-4">
              {project.technicalSheets.map((sheet: any, index: number) => (
                <div key={sheet.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 border border-minimal-lightgray bg-minimal-white hover:bg-gray-50 transition-colors no-print">
                  <div className="flex-shrink-0 w-10 h-10 bg-minimal-black text-minimal-white flex items-center justify-center font-sans font-semibold text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-sans font-medium text-minimal-black">{sheet.productName}</p>
                    <p className="text-xs text-gray-500 mt-1 break-all">{sheet.fileName}</p>
                  </div>
                  <a
                    href={sheet.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto flex-shrink-0 px-4 py-2 bg-minimal-black text-minimal-white font-sans text-sm hover:bg-gray-800 transition-colors text-center"
                  >
                    Ver ficha técnica →
                  </a>
                </div>
              ))}

              {/* Print-only version */}
              <div className="print-only space-y-2 mt-6">
                {project.technicalSheets.map((sheet: any, index: number) => (
                  <div key={sheet.id} className="flex items-baseline gap-2">
                    <span className="font-sans font-medium text-minimal-black">{index + 1}.</span>
                    <span className="font-sans text-minimal-black">{sheet.productName}</span>
                    <span className="text-gray-600 text-sm">— Ver ficha técnica</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Project Stats */}
        <div className="content-box-large">
          <div className="stats-grid">
            <div>
              <div className="stat-number">{project.beforeImages.length}</div>
              <div className="stat-label">Áreas</div>
            </div>
            <div>
              <div className="stat-number">{project.afterImages.length + project.beforeImages.length}</div>
              <div className="stat-label">Fotos</div>
            </div>
            <div>
              <div className="stat-number">{project.viewCount || 0}</div>
              <div className="stat-label">Vistas</div>
            </div>
            <div>
              <div className="stat-number">100%</div>
              <div className="stat-label">Calidad</div>
            </div>
          </div>
        </div>

        {/* Gallery Section */}
        <div className="mb-section gallery-section">
          <div className="mb-10">
            <h3 className="section-title-serif">
              Galería Completa
            </h3>
            <div className="divider-short"></div>
          </div>

          {/* Container principal blanco para toda la galería */}
          <div className="gallery-container">

            {/* Before Gallery */}
            <div className="mb-12">
              <div className="mb-6 gallery-header">
                <h4 className="gallery-section-title">
                  Antes de la Reforma
                </h4>
              </div>
              <div className="gallery-grid">
                {project.beforeImages.map((img: any) => (
                  <div key={img.id} className="gallery-item">
                    <div className="gallery-item-inner">
                      <div className="relative h-full overflow-hidden">
                        <img
                          src={img.url}
                          alt="Antes"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Separador simple */}
            <div className="divider-full"></div>

            {/* After Gallery */}
            <div>
              <div className="mb-6 gallery-header">
                <h4 className="gallery-section-title">
                  Después de la Reforma
                </h4>
              </div>
              <div className="gallery-grid">
                {project.afterImages.map((img: any) => (
                  <div key={img.id} className="gallery-item">
                    <div className="gallery-item-inner">
                      <div className="relative h-full overflow-hidden">
                        <img
                          src={img.url}
                          alt="Después"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="max-w-5xl mx-auto px-8 sm:px-12 md:px-16 lg:px-20">
          <div className="footer-content">
            {/* Columna izquierda: Logo y tagline */}
            <div>
              <h2 className="footer-brand">Abu24.</h2>
              <p className="footer-tagline">
                Construcción y Reformas
              </p>
            </div>

            {/* Columna derecha: Copyright simple */}
            <div className="text-left md:text-right">
              <p className="footer-copyright mb-1">
                © 2025 {project.company.name}
              </p>
              <p className="footer-info">
                Disponible 24 horas
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
