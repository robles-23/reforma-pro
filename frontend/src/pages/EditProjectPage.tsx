import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { useAuthStore } from '../stores/authStore';
import { api } from '../lib/api';

interface Image {
  id: string;
  type: 'BEFORE' | 'AFTER';
  thumbnailUrl: string;
  mediumUrl: string;
  fileName: string;
  orderIndex: number;
}

export default function EditProjectPage() {
  const navigate = useNavigate();
  const { projectId } = useParams<{ projectId: string }>();
  const { user, logout } = useAuthStore();

  // Project info
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [clientName, setClientName] = useState('');
  const [storeCode, setStoreCode] = useState('');

  // Images
  const [beforeImages, setBeforeImages] = useState<Image[]>([]);
  const [afterImages, setAfterImages] = useState<Image[]>([]);
  const [uploadingBefore, setUploadingBefore] = useState(false);
  const [uploadingAfter, setUploadingAfter] = useState(false);
  const [deletingImage, setDeletingImage] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [project, setProject] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'images'>('info');

  // Load existing project data
  useEffect(() => {
    loadProject();
  }, [projectId]);

  const loadProject = async () => {
    if (!projectId) {
      setError('ID de proyecto no válido');
      setLoading(false);
      return;
    }

    try {
      const res = await api.get(`/projects/${projectId}`);
      const projectData = res.data.data;

      setProject(projectData);
      setTitle(projectData.title || '');
      setDescription(projectData.descriptionOriginal || '');
      setLocation(projectData.location || '');
      setClientName(projectData.clientName || '');
      setStoreCode(projectData.storeCode || '');

      // Separate images by type
      if (projectData.images) {
        setBeforeImages(projectData.images.filter((img: Image) => img.type === 'BEFORE'));
        setAfterImages(projectData.images.filter((img: Image) => img.type === 'AFTER'));
      }

      setLoading(false);
    } catch (err: any) {
      console.error('Failed to load project:', err);
      if (err.response?.status === 401) {
        logout();
        navigate('/login');
      } else if (err.response?.status === 403) {
        setError('No tienes permiso para editar este proyecto');
      } else {
        setError(err.response?.data?.message || 'No se pudo cargar el proyecto');
      }
      setLoading(false);
    }
  };

  const handleDeleteImage = async (imageId: string, type: 'BEFORE' | 'AFTER') => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta imagen?')) return;

    setDeletingImage(imageId);
    try {
      await api.delete(`/images/${imageId}`);

      // Update local state
      if (type === 'BEFORE') {
        setBeforeImages(prev => prev.filter(img => img.id !== imageId));
      } else {
        setAfterImages(prev => prev.filter(img => img.id !== imageId));
      }
    } catch (err: any) {
      console.error('Failed to delete image:', err);
      alert(err.response?.data?.message || 'No se pudo eliminar la imagen');
    } finally {
      setDeletingImage(null);
    }
  };

  const handleUploadImages = async (files: File[], type: 'BEFORE' | 'AFTER') => {
    const currentImages = type === 'BEFORE' ? beforeImages : afterImages;
    const remainingSlots = 20 - currentImages.length;

    if (files.length > remainingSlots) {
      alert(`Solo puedes subir ${remainingSlots} imagen(es) más de tipo ${type}. Límite: 20 imágenes por tipo.`);
      return;
    }

    const setUploading = type === 'BEFORE' ? setUploadingBefore : setUploadingAfter;
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('projectId', projectId!);
      files.forEach(file => formData.append('images', file));

      const endpoint = type === 'BEFORE' ? '/images/upload/before' : '/images/upload/after';
      await api.post(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      // Reload project to get updated images
      await loadProject();
    } catch (err: any) {
      console.error('Failed to upload images:', err);
      alert(err.response?.data?.message || 'No se pudieron subir las imágenes');
    } finally {
      setUploading(false);
    }
  };

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
    maxFiles: 20 - beforeImages.length,
    onDrop: (acceptedFiles) => handleUploadImages(acceptedFiles, 'BEFORE'),
    disabled: beforeImages.length >= 20 || uploadingBefore,
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
    maxFiles: 20 - afterImages.length,
    onDrop: (acceptedFiles) => handleUploadImages(acceptedFiles, 'AFTER'),
    disabled: afterImages.length >= 20 || uploadingAfter,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('El título es obligatorio');
      return;
    }

    if (!description.trim() || description.length < 10) {
      setError('La descripción debe tener al menos 10 caracteres');
      return;
    }

    setSaving(true);

    try {
      const updateData: any = {
        title: title.trim(),
        descriptionOriginal: description.trim(),
      };

      if (location.trim()) updateData.location = location.trim();
      if (clientName.trim()) updateData.clientName = clientName.trim();
      if (storeCode.trim()) updateData.storeCode = storeCode.trim();

      await api.patch(`/projects/${projectId}`, updateData);

      // Redirect to presentation page
      if (project?.presentationToken) {
        navigate(`/p/${project.presentationToken}`);
      } else {
        navigate('/upload');
      }
    } catch (err: any) {
      console.error('Failed to update project:', err);
      if (err.response?.status === 401) {
        logout();
        navigate('/login');
      } else {
        setError(err.response?.data?.message || 'No se pudo actualizar el proyecto');
      }
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (project?.presentationToken) {
      navigate(`/p/${project.presentationToken}`);
    } else {
      navigate('/upload');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-olive-50 via-sage-50 to-olive-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full shadow-soft-lg mb-4">
            <svg className="animate-spin w-8 h-8 text-olive-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
          <p className="text-olive-700 font-medium">Cargando proyecto...</p>
        </div>
      </div>
    );
  }

  if (error && !project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-olive-50 via-sage-50 to-olive-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-soft-lg p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-olive-900 mb-2">Error</h2>
          <p className="text-olive-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/upload')}
            className="px-6 py-2 bg-gradient-to-r from-olive-600 to-olive-700 text-white font-medium rounded-md hover:from-olive-700 hover:to-olive-800 transition-all"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-olive-50 via-sage-50 to-olive-100">
      {/* Header */}
      <header className="bg-white border-b border-olive-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-olive-900">Abu24 Reportes</h1>
              <p className="text-sm text-olive-600">Editar Proyecto</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-olive-900">{user?.email}</p>
                <p className="text-xs text-olive-600 capitalize">{user?.role?.toLowerCase()}</p>
              </div>
              <button
                onClick={logout}
                className="px-4 py-2 text-sm text-olive-700 hover:text-olive-900 font-medium transition-colors"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="mb-6 border-b border-olive-200">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('info')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'info'
                  ? 'border-olive-600 text-olive-900'
                  : 'border-transparent text-olive-600 hover:text-olive-900 hover:border-olive-300'
              }`}
            >
              Información del Proyecto
            </button>
            <button
              onClick={() => setActiveTab('images')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'images'
                  ? 'border-olive-600 text-olive-900'
                  : 'border-transparent text-olive-600 hover:text-olive-900 hover:border-olive-300'
              }`}
            >
              Imágenes ({beforeImages.length + afterImages.length})
            </button>
          </div>
        </div>

        {/* Info Tab */}
        {activeTab === 'info' && (
          <div className="bg-white rounded-lg shadow-soft-lg p-6 sm:p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-olive-900 mb-2">Editar Información del Proyecto</h2>
              <p className="text-olive-600">Modifica los datos del proyecto y guarda los cambios.</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-red-600 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-olive-900 mb-2">
                  Título del Proyecto <span className="text-red-500">*</span>
                </label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  maxLength={500}
                  className="w-full px-4 py-3 rounded-md border border-olive-200 focus:outline-none focus:ring-2 focus:ring-olive-500 focus:border-transparent transition-all"
                  placeholder="Ej: Reforma integral de cocina"
                  disabled={saving}
                />
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-olive-900 mb-2">
                  Descripción <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  minLength={10}
                  maxLength={5000}
                  rows={6}
                  className="w-full px-4 py-3 rounded-md border border-olive-200 focus:outline-none focus:ring-2 focus:ring-olive-500 focus:border-transparent transition-all resize-none"
                  placeholder="Describe los trabajos realizados, materiales utilizados, etc."
                  disabled={saving}
                />
                <p className="mt-1 text-xs text-olive-500">
                  {description.length} / 5000 caracteres
                </p>
              </div>

              {/* Location */}
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-olive-900 mb-2">
                  Ubicación
                </label>
                <input
                  id="location"
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  maxLength={500}
                  className="w-full px-4 py-3 rounded-md border border-olive-200 focus:outline-none focus:ring-2 focus:ring-olive-500 focus:border-transparent transition-all"
                  placeholder="Ej: Madrid, España"
                  disabled={saving}
                />
              </div>

              {/* Client Name */}
              <div>
                <label htmlFor="clientName" className="block text-sm font-medium text-olive-900 mb-2">
                  Nombre del Cliente
                </label>
                <input
                  id="clientName"
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  maxLength={255}
                  className="w-full px-4 py-3 rounded-md border border-olive-200 focus:outline-none focus:ring-2 focus:ring-olive-500 focus:border-transparent transition-all"
                  placeholder="Ej: Juan Pérez"
                  disabled={saving}
                />
              </div>

              {/* Store Code */}
              <div>
                <label htmlFor="storeCode" className="block text-sm font-medium text-olive-900 mb-2">
                  Código de Tienda
                </label>
                <input
                  id="storeCode"
                  type="text"
                  value={storeCode}
                  onChange={(e) => setStoreCode(e.target.value)}
                  maxLength={100}
                  className="w-full px-4 py-3 rounded-md border border-olive-200 focus:outline-none focus:ring-2 focus:ring-olive-500 focus:border-transparent transition-all"
                  placeholder="Ej: MAD-001"
                  disabled={saving}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-3 px-6 bg-gradient-to-r from-olive-600 to-olive-700 text-white font-medium rounded-md hover:from-olive-700 hover:to-olive-800 focus:outline-none focus:ring-2 focus:ring-olive-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-soft"
                >
                  {saving ? 'Guardando...' : 'Guardar Cambios'}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={saving}
                  className="flex-1 py-3 px-6 bg-white text-olive-700 font-medium rounded-md border border-olive-300 hover:bg-olive-50 focus:outline-none focus:ring-2 focus:ring-olive-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Images Tab */}
        {activeTab === 'images' && (
          <div className="space-y-8">
            {/* Before Images */}
            <div className="bg-white rounded-lg shadow-soft-lg p-6 sm:p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-olive-900 mb-2">Imágenes ANTES ({beforeImages.length}/20)</h2>
                <p className="text-olive-600">Gestiona las imágenes del estado antes de la reforma.</p>
              </div>

              {/* Image Grid */}
              {beforeImages.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-6">
                  {beforeImages.map((img) => (
                    <div key={img.id} className="relative group">
                      <img
                        src={img.thumbnailUrl}
                        alt={img.fileName}
                        className="w-full h-32 object-cover rounded-md border border-olive-200"
                      />
                      <button
                        onClick={() => handleDeleteImage(img.id, 'BEFORE')}
                        disabled={deletingImage === img.id}
                        className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50 hover:bg-red-700"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Upload Dropzone */}
              {beforeImages.length < 20 && (
                <div
                  {...getBeforeRootProps()}
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                    isBeforeDragActive
                      ? 'border-olive-600 bg-olive-50'
                      : 'border-olive-300 hover:border-olive-500'
                  } ${uploadingBefore ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <input {...getBeforeInputProps()} />
                  {uploadingBefore ? (
                    <div className="flex flex-col items-center">
                      <svg className="animate-spin w-12 h-12 text-olive-600 mb-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <p className="text-olive-700 font-medium">Subiendo imágenes...</p>
                    </div>
                  ) : (
                    <>
                      <svg className="mx-auto w-12 h-12 text-olive-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <p className="text-olive-900 font-medium mb-1">
                        Arrastra imágenes ANTES aquí o haz clic para seleccionar
                      </p>
                      <p className="text-sm text-olive-600">
                        JPG, PNG o WEBP (máx. 10MB por imagen) • {20 - beforeImages.length} restantes
                      </p>
                    </>
                  )}
                </div>
              )}

              {beforeImages.length >= 20 && (
                <div className="p-4 bg-olive-50 border border-olive-200 rounded-md text-center">
                  <p className="text-sm text-olive-700">Límite alcanzado: 20 imágenes ANTES</p>
                </div>
              )}
            </div>

            {/* After Images */}
            <div className="bg-white rounded-lg shadow-soft-lg p-6 sm:p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-olive-900 mb-2">Imágenes DESPUÉS ({afterImages.length}/20)</h2>
                <p className="text-olive-600">Gestiona las imágenes del estado después de la reforma.</p>
              </div>

              {/* Image Grid */}
              {afterImages.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-6">
                  {afterImages.map((img) => (
                    <div key={img.id} className="relative group">
                      <img
                        src={img.thumbnailUrl}
                        alt={img.fileName}
                        className="w-full h-32 object-cover rounded-md border border-olive-200"
                      />
                      <button
                        onClick={() => handleDeleteImage(img.id, 'AFTER')}
                        disabled={deletingImage === img.id}
                        className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50 hover:bg-red-700"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Upload Dropzone */}
              {afterImages.length < 20 && (
                <div
                  {...getAfterRootProps()}
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                    isAfterDragActive
                      ? 'border-olive-600 bg-olive-50'
                      : 'border-olive-300 hover:border-olive-500'
                  } ${uploadingAfter ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <input {...getAfterInputProps()} />
                  {uploadingAfter ? (
                    <div className="flex flex-col items-center">
                      <svg className="animate-spin w-12 h-12 text-olive-600 mb-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <p className="text-olive-700 font-medium">Subiendo imágenes...</p>
                    </div>
                  ) : (
                    <>
                      <svg className="mx-auto w-12 h-12 text-olive-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <p className="text-olive-900 font-medium mb-1">
                        Arrastra imágenes DESPUÉS aquí o haz clic para seleccionar
                      </p>
                      <p className="text-sm text-olive-600">
                        JPG, PNG o WEBP (máx. 10MB por imagen) • {20 - afterImages.length} restantes
                      </p>
                    </>
                  )}
                </div>
              )}

              {afterImages.length >= 20 && (
                <div className="p-4 bg-olive-50 border border-olive-200 rounded-md text-center">
                  <p className="text-sm text-olive-700">Límite alcanzado: 20 imágenes DESPUÉS</p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <button
                onClick={handleCancel}
                className="py-3 px-6 bg-white text-olive-700 font-medium rounded-md border border-olive-300 hover:bg-olive-50 transition-all"
              >
                Volver
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
