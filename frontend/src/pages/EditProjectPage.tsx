import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { api } from '../lib/api';

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

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [project, setProject] = useState<any>(null);

  // Load existing project data
  useEffect(() => {
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

    loadProject();
  }, [projectId, logout, navigate]);

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
              <h1 className="text-2xl font-bold text-olive-900">Reforma Pro</h1>
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
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

        {/* Info Note */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-sm text-blue-700">
              <p className="font-medium mb-1">Nota:</p>
              <p>Solo puedes editar la información del proyecto. Las imágenes y documentos no se pueden modificar en esta versión.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
