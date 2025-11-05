import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { useAuthStore } from '../stores/authStore';
import { api } from '../lib/api';

interface UploadedImage {
  id: string;
  file: File;
  preview: string;
}

interface TechnicalSheet {
  id: string;
  productName: string;
  file: File | null;
}

export default function UploadPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [step, setStep] = useState<'info' | 'before' | 'after' | 'deliveryNote' | 'technicalSheets' | 'processing'>('info');

  // Project info
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [clientName, setClientName] = useState('');
  const [storeCode, setStoreCode] = useState('');

  // Images
  const [beforeImages, setBeforeImages] = useState<UploadedImage[]>([]);
  const [afterImages, setAfterImages] = useState<UploadedImage[]>([]);
  const [deliveryNoteImages, setDeliveryNoteImages] = useState<UploadedImage[]>([]);
  const [budgetFiles, setBudgetFiles] = useState<File[]>([]);
  const [electronicInvoiceFiles, setElectronicInvoiceFiles] = useState<File[]>([]);

  // Technical Sheets
  const [technicalSheets, setTechnicalSheets] = useState<TechnicalSheet[]>([
    { id: '1', productName: '', file: null }
  ]);

  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<string>('');

  // Before images dropzone
  const {
    getRootProps: getBeforeRootProps,
    getInputProps: getBeforeInputProps,
    isDragActive: isBeforeDragActive,
  } = useDropzone({
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    maxFiles: 20,
    onDrop: (acceptedFiles) => {
      const newImages = acceptedFiles.map((file) => ({
        id: Math.random().toString(36).substring(7),
        file,
        preview: URL.createObjectURL(file),
      }));
      setBeforeImages((prev) => [...prev, ...newImages].slice(0, 20));
    },
  });

  // After images dropzone
  const {
    getRootProps: getAfterRootProps,
    getInputProps: getAfterInputProps,
    isDragActive: isAfterDragActive,
  } = useDropzone({
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
    },
    maxSize: 10 * 1024 * 1024,
    maxFiles: 20,
    onDrop: (acceptedFiles) => {
      const newImages = acceptedFiles.map((file) => ({
        id: Math.random().toString(36).substring(7),
        file,
        preview: URL.createObjectURL(file),
      }));
      setAfterImages((prev) => [...prev, ...newImages].slice(0, 20));
    },
  });

  // Delivery note dropzone
  const {
    getRootProps: getDeliveryNoteRootProps,
    getInputProps: getDeliveryNoteInputProps,
    isDragActive: isDeliveryNoteDragActive,
  } = useDropzone({
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
    },
    maxSize: 10 * 1024 * 1024,
    maxFiles: 2,
    onDrop: (acceptedFiles) => {
      const newImages = acceptedFiles.map((file) => ({
        id: Math.random().toString(36).substring(7),
        file,
        preview: URL.createObjectURL(file),
      }));
      setDeliveryNoteImages((prev) => [...prev, ...newImages].slice(0, 2));
    },
  });

  const removeBeforeImage = (id: string) => {
    setBeforeImages((prev) => prev.filter((img) => img.id !== id));
  };

  const removeAfterImage = (id: string) => {
    setAfterImages((prev) => prev.filter((img) => img.id !== id));
  };

  const removeDeliveryNoteImage = (id: string) => {
    setDeliveryNoteImages((prev) => prev.filter((img) => img.id !== id));
  };

  const removeBudgetFile = (index: number) => {
    setBudgetFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const removeElectronicInvoiceFile = (index: number) => {
    setElectronicInvoiceFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const addTechnicalSheet = () => {
    if (technicalSheets.length < 10) {
      setTechnicalSheets((prev) => [
        ...prev,
        { id: Math.random().toString(36).substring(7), productName: '', file: null }
      ]);
    }
  };

  const removeTechnicalSheet = (id: string) => {
    if (technicalSheets.length > 1) {
      setTechnicalSheets((prev) => prev.filter((sheet) => sheet.id !== id));
    }
  };

  const updateTechnicalSheet = (id: string, field: 'productName' | 'file', value: string | File) => {
    setTechnicalSheets((prev) =>
      prev.map((sheet) =>
        sheet.id === id ? { ...sheet, [field]: value } : sheet
      )
    );
  };

  const handleSubmit = async () => {
    setProcessing(true);
    setStep('processing');
    setError(null);

    try {
      // Step 1: Create project
      setUploadProgress('Creando proyecto...');
      const projectRes = await api.post('/projects', {
        title,
        descriptionOriginal: description,
        location: location || undefined,
        clientName: clientName || undefined,
        storeCode: storeCode || undefined,
      });
      const projectId = projectRes.data.data.id;

      // Step 2: Upload before images
      setUploadProgress(`Subiendo ${beforeImages.length} fotos "antes"...`);
      const beforeFormData = new FormData();
      beforeFormData.append('projectId', projectId);
      beforeImages.forEach(img => beforeFormData.append('images', img.file));
      await api.post('/images/upload/before', beforeFormData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      // Step 3: Upload after images
      setUploadProgress(`Subiendo ${afterImages.length} fotos "después"...`);
      const afterFormData = new FormData();
      afterFormData.append('projectId', projectId);
      afterImages.forEach(img => afterFormData.append('images', img.file));
      await api.post('/images/upload/after', afterFormData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      // Step 4: Upload delivery note images (if any)
      if (deliveryNoteImages.length > 0) {
        setUploadProgress(`Subiendo ${deliveryNoteImages.length} imágenes de albarán...`);
        const deliveryNoteFormData = new FormData();
        deliveryNoteImages.forEach(img => deliveryNoteFormData.append('images', img.file));
        await api.post(`/projects/${projectId}/delivery-notes`, deliveryNoteFormData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      // Step 5: Upload budget files (if any)
      if (budgetFiles.length > 0) {
        setUploadProgress('Subiendo presupuesto...');
        const budgetFormData = new FormData();
        budgetFiles.forEach(file => budgetFormData.append('files', file));
        await api.post(`/projects/${projectId}/budgets`, budgetFormData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      // Step 6: Upload electronic invoice files (if any)
      if (electronicInvoiceFiles.length > 0) {
        setUploadProgress('Subiendo factura electrónica...');
        const electronicInvoiceFormData = new FormData();
        electronicInvoiceFiles.forEach(file => electronicInvoiceFormData.append('files', file));
        await api.post(`/projects/${projectId}/electronic-invoices`, electronicInvoiceFormData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      // Step 7: Upload technical sheets (if any)
      const validSheets = technicalSheets.filter(s => s.productName.trim() && s.file);
      if (validSheets.length > 0) {
        setUploadProgress(`Subiendo ${validSheets.length} fichas técnicas...`);
        const technicalSheetFormData = new FormData();
        const productNames = validSheets.map(s => s.productName.trim());
        validSheets.forEach(s => technicalSheetFormData.append('pdfs', s.file!));
        technicalSheetFormData.append('productNames', JSON.stringify(productNames));
        await api.post(`/projects/${projectId}/technical-sheets`, technicalSheetFormData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      // Step 8: Trigger AI generation
      setUploadProgress('Generando presentación con IA...');
      const genRes = await api.post(`/projects/${projectId}/generate`);
      const token = genRes.data.data.presentationToken;

      // Step 9: Poll for completion
      let attempts = 0;
      const maxAttempts = 60; // 2 minutes max

      while (attempts < maxAttempts) {
        await new Promise(r => setTimeout(r, 2000)); // Wait 2 seconds

        const statusRes = await api.get(`/projects/${projectId}/status`);
        const status = statusRes.data.data.status;

        if (status === 'COMPLETED') {
          setUploadProgress('¡Listo! Redirigiendo...');
          setTimeout(() => {
            navigate(`/p/${token}`);
          }, 500);
          return;
        } else if (status === 'FAILED') {
          throw new Error('La generación de la presentación falló. Por favor, intenta de nuevo.');
        }

        attempts++;
      }

      // If we reach here, it timed out but presentation might still be accessible
      navigate(`/p/${token}`);

    } catch (err: any) {
      console.error('Error creating presentation:', err);
      setError(err.response?.data?.message || err.message || 'Ocurrió un error. Por favor, intenta de nuevo.');
      setProcessing(false);
      setStep('technicalSheets'); // Go back to last step so user can retry
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-olive-50 via-sage-50 to-olive-100">
      {/* Header */}
      <header className="bg-white shadow-soft sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-olive-600 to-olive-700 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-olive-900">Reforma Pro</h1>
                <p className="text-xs text-olive-600">Bienvenido, {user?.name}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-olive-700 hover:bg-olive-50 rounded-md transition-colors text-sm font-medium"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-2 flex-wrap">
            {['Info', 'Antes', 'Después', 'Albarán', 'Fichas', 'Procesar'].map((label, index) => {
              const steps = ['info', 'before', 'after', 'deliveryNote', 'technicalSheets', 'processing'];
              const currentIndex = steps.indexOf(step);
              const isActive = index === currentIndex;
              const isCompleted = index < currentIndex;

              return (
                <div key={label} className="flex items-center">
                  <div
                    className={`
                      flex items-center justify-center w-8 h-8 rounded-full font-semibold text-xs
                      ${isCompleted ? 'bg-olive-600 text-white' : ''}
                      ${isActive ? 'bg-olive-600 text-white ring-4 ring-olive-200' : ''}
                      ${!isActive && !isCompleted ? 'bg-olive-200 text-olive-700' : ''}
                    `}
                  >
                    {isCompleted ? '✓' : index + 1}
                  </div>
                  <span className={`ml-1 text-xs font-medium ${isActive ? 'text-olive-900' : 'text-olive-600'}`}>
                    {label}
                  </span>
                  {index < 5 && (
                    <div className={`w-8 h-0.5 mx-1 ${isCompleted ? 'bg-olive-600' : 'bg-olive-200'}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-lg shadow-soft-lg p-8">
          {/* Step 1: Project Info */}
          {step === 'info' && (
            <div className="space-y-6 animate-fadeIn">
              <h2 className="text-2xl font-bold text-olive-900">Información del Proyecto</h2>

              <div>
                <label className="block text-sm font-medium text-olive-900 mb-2">
                  Título del Proyecto *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ej: Mantenimiento Almacén Cosum - Limpieza y Eliminación de Óxido"
                  className="w-full px-4 py-3 rounded-md border border-olive-200 focus:outline-none focus:ring-2 focus:ring-olive-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-olive-900 mb-2">
                  Descripción del Trabajo *
                  <span className="text-olive-600 font-normal ml-1">(puede ser informal)</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ej: Limpieza profunda del almacén, eliminación de óxido en estanterías metálicas, pintura anticorrosiva, sellado de grietas..."
                  rows={5}
                  className="w-full px-4 py-3 rounded-md border border-olive-200 focus:outline-none focus:ring-2 focus:ring-olive-500 focus:border-transparent resize-none"
                  required
                />
                <p className="mt-2 text-xs text-olive-600">
                  La IA mejorará esta descripción para que suene más profesional.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-olive-900 mb-2">
                    Ubicación
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Ej: Almacén Central Cosum, Zaragoza"
                    className="w-full px-4 py-3 rounded-md border border-olive-200 focus:outline-none focus:ring-2 focus:ring-olive-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-olive-900 mb-2">
                    Nombre del Cliente
                  </label>
                  <input
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="Ej: Cosum S.A."
                    className="w-full px-4 py-3 rounded-md border border-olive-200 focus:outline-none focus:ring-2 focus:ring-olive-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-olive-900 mb-2">
                  Código de Tienda
                </label>
                <input
                  type="text"
                  value={storeCode}
                  onChange={(e) => setStoreCode(e.target.value)}
                  placeholder="Ej: ZARA-001, opcional"
                  className="w-full px-4 py-3 rounded-md border border-olive-200 focus:outline-none focus:ring-2 focus:ring-olive-500 focus:border-transparent"
                />
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => setStep('before')}
                  disabled={!title || !description || description.length < 10}
                  className="px-6 py-3 bg-gradient-to-r from-olive-600 to-olive-700 text-white font-medium rounded-md hover:from-olive-700 hover:to-olive-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-soft"
                >
                  Siguiente: Fotos "Antes"
                </button>
              </div>
              {description && description.length < 10 && (
                <p className="text-red-600 text-sm mt-2">La descripción debe tener al menos 10 caracteres</p>
              )}
            </div>
          )}

          {/* Step 2: Before Images */}
          {step === 'before' && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h2 className="text-2xl font-bold text-olive-900">Fotos "Antes"</h2>
                <p className="text-olive-600 mt-1">Sube entre 1 y 20 fotos del estado original</p>
              </div>

              {/* Dropzone */}
              <div
                {...getBeforeRootProps()}
                className={`
                  border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-all
                  ${isBeforeDragActive ? 'border-olive-600 bg-olive-50' : 'border-olive-300 hover:border-olive-500 hover:bg-olive-50'}
                `}
              >
                <input {...getBeforeInputProps()} />
                <div className="space-y-2">
                  <svg className="mx-auto w-12 h-12 text-olive-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="text-olive-700 font-medium">
                    {isBeforeDragActive ? 'Suelta las imágenes aquí' : 'Arrastra imágenes o haz clic para seleccionar'}
                  </p>
                  <p className="text-sm text-olive-600">JPG, PNG o WEBP (máx. 10MB por imagen)</p>
                  <p className="text-sm text-olive-600">{beforeImages.length}/20 imágenes</p>
                </div>
              </div>

              {/* Image Grid */}
              {beforeImages.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {beforeImages.map((img) => (
                    <div key={img.id} className="relative group">
                      <img
                        src={img.preview}
                        alt="Before"
                        className="w-full h-32 object-cover rounded-md"
                      />
                      <button
                        onClick={() => removeBeforeImage(img.id)}
                        className="absolute top-2 right-2 w-6 h-6 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs font-bold hover:bg-red-700"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Navigation */}
              <div className="flex justify-between pt-4">
                <button
                  onClick={() => setStep('info')}
                  className="px-6 py-3 text-olive-700 hover:bg-olive-50 rounded-md transition-colors font-medium"
                >
                  ← Volver
                </button>
                <button
                  onClick={() => setStep('after')}
                  disabled={beforeImages.length === 0}
                  className="px-6 py-3 bg-gradient-to-r from-olive-600 to-olive-700 text-white font-medium rounded-md hover:from-olive-700 hover:to-olive-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-soft"
                >
                  Siguiente: Fotos "Después"
                </button>
              </div>
            </div>
          )}

          {/* Step 3: After Images */}
          {step === 'after' && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h2 className="text-2xl font-bold text-olive-900">Fotos "Después"</h2>
                <p className="text-olive-600 mt-1">Sube entre 1 y 20 fotos del resultado final</p>
              </div>

              {/* Dropzone */}
              <div
                {...getAfterRootProps()}
                className={`
                  border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-all
                  ${isAfterDragActive ? 'border-olive-600 bg-olive-50' : 'border-olive-300 hover:border-olive-500 hover:bg-olive-50'}
                `}
              >
                <input {...getAfterInputProps()} />
                <div className="space-y-2">
                  <svg className="mx-auto w-12 h-12 text-olive-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="text-olive-700 font-medium">
                    {isAfterDragActive ? 'Suelta las imágenes aquí' : 'Arrastra imágenes o haz clic para seleccionar'}
                  </p>
                  <p className="text-sm text-olive-600">JPG, PNG o WEBP (máx. 10MB por imagen)</p>
                  <p className="text-sm text-olive-600">{afterImages.length}/20 imágenes</p>
                </div>
              </div>

              {/* Image Grid */}
              {afterImages.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {afterImages.map((img) => (
                    <div key={img.id} className="relative group">
                      <img
                        src={img.preview}
                        alt="After"
                        className="w-full h-32 object-cover rounded-md"
                      />
                      <button
                        onClick={() => removeAfterImage(img.id)}
                        className="absolute top-2 right-2 w-6 h-6 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs font-bold hover:bg-red-700"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Error Display */}
              {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-red-800 font-medium">{error}</p>
                </div>
              )}

              {/* Navigation */}
              <div className="flex justify-between pt-4">
                <button
                  onClick={() => setStep('before')}
                  className="px-6 py-3 text-olive-700 hover:bg-olive-50 rounded-md transition-colors font-medium"
                  disabled={processing}
                >
                  ← Volver
                </button>
                <button
                  onClick={() => setStep('deliveryNote')}
                  disabled={afterImages.length === 0}
                  className="px-6 py-3 bg-gradient-to-r from-olive-600 to-olive-700 text-white font-medium rounded-md hover:from-olive-700 hover:to-olive-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-soft"
                >
                  Siguiente: Albarán
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Delivery Note (Albarán) */}
          {step === 'deliveryNote' && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h2 className="text-2xl font-bold text-olive-900">Albarán (Opcional)</h2>
                <p className="text-olive-600 mt-1">Sube 1-2 imágenes del albarán de entrega</p>
              </div>

              {/* Dropzone */}
              <div
                {...getDeliveryNoteRootProps()}
                className={`
                  border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-all
                  ${isDeliveryNoteDragActive ? 'border-olive-600 bg-olive-50' : 'border-olive-300 hover:border-olive-500 hover:bg-olive-50'}
                `}
              >
                <input {...getDeliveryNoteInputProps()} />
                <div className="space-y-2">
                  <svg className="mx-auto w-12 h-12 text-olive-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="text-olive-700 font-medium">
                    {isDeliveryNoteDragActive ? 'Suelta las imágenes aquí' : 'Arrastra imágenes o haz clic para seleccionar'}
                  </p>
                  <p className="text-sm text-olive-600">JPG, PNG o WEBP (máx. 10MB por imagen)</p>
                  <p className="text-sm text-olive-600">{deliveryNoteImages.length}/2 imágenes</p>
                </div>
              </div>

              {/* Image Grid */}
              {deliveryNoteImages.length > 0 && (
                <div className="grid grid-cols-2 gap-4">
                  {deliveryNoteImages.map((img) => (
                    <div key={img.id} className="relative group">
                      <img
                        src={img.preview}
                        alt="Delivery Note"
                        className="w-full h-48 object-cover rounded-md"
                      />
                      <button
                        onClick={() => removeDeliveryNoteImage(img.id)}
                        className="absolute top-2 right-2 w-6 h-6 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs font-bold hover:bg-red-700"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Budget Section */}
              <div className="mt-8 pt-8 border-t border-olive-200">
                <div>
                  <h3 className="text-xl font-bold text-olive-900">Presupuesto (Opcional)</h3>
                  <p className="text-olive-600 mt-1">Sube 1 archivo PDF o imagen del presupuesto</p>
                </div>

                {/* File Upload Input */}
                <div className="mt-4">
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setBudgetFiles([file]);
                      }
                    }}
                    disabled={budgetFiles.length >= 1}
                    className="w-full text-sm text-olive-700 file:mr-4 file:py-3 file:px-6 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-olive-100 file:text-olive-700 hover:file:bg-olive-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>

                {/* File Preview */}
                {budgetFiles.length > 0 && (
                  <div className="mt-4">
                    {budgetFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-olive-50 border border-olive-200 rounded-md">
                        <div className="flex items-center space-x-3">
                          <svg className="w-8 h-8 text-olive-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <div>
                            <p className="text-sm font-medium text-olive-900">{file.name}</p>
                            <p className="text-xs text-olive-600">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                          </div>
                        </div>
                        <button
                          onClick={() => removeBudgetFile(index)}
                          className="w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center text-sm font-bold hover:bg-red-700"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Electronic Invoice Section */}
              <div className="mt-8 pt-8 border-t border-olive-200">
                <div>
                  <h3 className="text-xl font-bold text-olive-900">Factura Electrónica (Opcional)</h3>
                  <p className="text-olive-600 mt-1">Sube 1 archivo PDF o imagen de la factura electrónica</p>
                </div>

                {/* File Upload Input */}
                <div className="mt-4">
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setElectronicInvoiceFiles([file]);
                      }
                    }}
                    disabled={electronicInvoiceFiles.length >= 1}
                    className="w-full text-sm text-olive-700 file:mr-4 file:py-3 file:px-6 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-olive-100 file:text-olive-700 hover:file:bg-olive-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>

                {/* File Preview */}
                {electronicInvoiceFiles.length > 0 && (
                  <div className="mt-4">
                    {electronicInvoiceFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-olive-50 border border-olive-200 rounded-md">
                        <div className="flex items-center space-x-3">
                          <svg className="w-8 h-8 text-olive-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <div>
                            <p className="text-sm font-medium text-olive-900">{file.name}</p>
                            <p className="text-xs text-olive-600">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                          </div>
                        </div>
                        <button
                          onClick={() => removeElectronicInvoiceFile(index)}
                          className="w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center text-sm font-bold hover:bg-red-700"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Navigation */}
              <div className="flex justify-between pt-4">
                <button
                  onClick={() => setStep('after')}
                  className="px-6 py-3 text-olive-700 hover:bg-olive-50 rounded-md transition-colors font-medium"
                >
                  ← Volver
                </button>
                <button
                  onClick={() => setStep('technicalSheets')}
                  className="px-6 py-3 bg-gradient-to-r from-olive-600 to-olive-700 text-white font-medium rounded-md hover:from-olive-700 hover:to-olive-800 transition-all shadow-soft"
                >
                  Siguiente: Fichas Técnicas
                </button>
              </div>
            </div>
          )}

          {/* Step 5: Technical Sheets */}
          {step === 'technicalSheets' && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h2 className="text-2xl font-bold text-olive-900">Fichas Técnicas de Productos (Opcional)</h2>
                <p className="text-olive-600 mt-1">Sube hasta 10 fichas técnicas en PDF con sus nombres</p>
              </div>

              {/* Technical Sheets List */}
              <div className="space-y-4">
                {technicalSheets.map((sheet, index) => (
                  <div key={sheet.id} className="flex items-center gap-4 p-4 border border-olive-200 rounded-md bg-olive-50">
                    <div className="flex-shrink-0 w-8 h-8 bg-olive-600 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <input
                        type="text"
                        value={sheet.productName}
                        onChange={(e) => updateTechnicalSheet(sheet.id, 'productName', e.target.value)}
                        placeholder="Nombre del producto"
                        className="w-full px-4 py-2 rounded-md border border-olive-200 focus:outline-none focus:ring-2 focus:ring-olive-500 focus:border-transparent"
                      />
                    </div>
                    <div className="flex-1">
                      <input
                        type="file"
                        accept=".pdf,application/pdf"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            updateTechnicalSheet(sheet.id, 'file', file);
                          }
                        }}
                        className="w-full text-sm text-olive-700 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-olive-100 file:text-olive-700 hover:file:bg-olive-200"
                      />
                      {sheet.file && (
                        <p className="text-xs text-olive-600 mt-1">
                          {sheet.file.name} ({(sheet.file.size / 1024 / 1024).toFixed(2)} MB)
                        </p>
                      )}
                    </div>
                    {technicalSheets.length > 1 && (
                      <button
                        onClick={() => removeTechnicalSheet(sheet.id)}
                        className="flex-shrink-0 w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center text-sm font-bold hover:bg-red-700"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Add More Button */}
              {technicalSheets.length < 10 && (
                <button
                  onClick={addTechnicalSheet}
                  className="w-full py-3 border-2 border-dashed border-olive-300 rounded-md text-olive-700 font-medium hover:border-olive-500 hover:bg-olive-50 transition-all"
                >
                  + Añadir otra ficha técnica ({technicalSheets.length}/10)
                </button>
              )}

              {/* Error Display */}
              {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-red-800 font-medium">{error}</p>
                </div>
              )}

              {/* Navigation */}
              <div className="flex justify-between pt-4">
                <button
                  onClick={() => setStep('deliveryNote')}
                  className="px-6 py-3 text-olive-700 hover:bg-olive-50 rounded-md transition-colors font-medium"
                  disabled={processing}
                >
                  ← Volver
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={processing}
                  className="px-6 py-3 bg-gradient-to-r from-olive-600 to-olive-700 text-white font-medium rounded-md hover:from-olive-700 hover:to-olive-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-soft"
                >
                  {processing ? 'Procesando...' : 'Generar Presentación'}
                </button>
              </div>
            </div>
          )}

          {/* Processing Step */}
          {step === 'processing' && (
            <div className="text-center py-12 animate-fadeIn">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-olive-100 mb-6">
                <svg className="animate-spin w-10 h-10 text-olive-600" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-olive-900 mb-2">Procesando...</h3>
              <p className="text-olive-600 mb-4">{uploadProgress || 'La IA está mejorando tu descripción y organizando las imágenes'}</p>
              {error && (
                <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-red-800 font-medium">{error}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
