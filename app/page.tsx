'use client';

import { useState, useEffect } from 'react';

export default function Home() {
  const [time, setTime] = useState(new Date());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  interface Pharmacy {
    id: string;
    name: string;
    address: string;
    phone: string;
    day: string;
    latitude?: number;
    longitude?: number;
    isOpen?: boolean;
  }

  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPharmacies = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
        const response = await fetch(`${apiUrl}/api/pharmacies`);
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const data = await response.json();
        const pharmacyList = data.pharmacies || [];

        // Map backend data to UI format if needed, or use directly
        // Backend returns: { pharmacies: [...] }
        setPharmacies(pharmacyList);
        setError(null);
      } catch (err) {
        console.error('Error fetching pharmacies:', err);
        setError('تعذر الاتصال بالخادم. يرجى التأكد من تشغيل Backend.');
        // Fallback to demo data if fetch fails
        setPharmacies([
          {
            id: 'demo1',
            name: "صيدلية الرحمة",
            address: "شارع محمد السادس، طنجة",
            phone: "0539-123456",
            day: "الإثنين",
            isOpen: true
          },
          {
            id: 'demo2',
            name: "صيدلية النور",
            address: "حي المسيرة، طنجة",
            phone: "0539-234567",
            day: "الثلاثاء"
          },
          {
            id: 'demo3',
            name: "صيدلية السلام",
            address: "المدينة القديمة، طنجة",
            phone: "0539-345678",
            day: "الأربعاء"
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchPharmacies();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50" dir="rtl">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-blue-900">🏥 صيدليات الحراسة - طنجة</h1>
              <p className="text-gray-600 mt-1">Pharmacies de Garde - Tanger</p>
            </div>
            <div className="text-left">
              <div className="text-sm text-gray-600">الوقت الحالي</div>
              <div className="text-lg font-semibold text-blue-900">
                {mounted ? time.toLocaleTimeString('ar-MA') : '--:--:--'}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Status Banner */}
        {loading ? (
          <div className="bg-blue-100 border-r-4 border-blue-500 text-blue-900 px-6 py-4 rounded-lg mb-8">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-900 ml-3"></div>
              <p>
                <strong>جاري التحميل:</strong> يتم الاتصال بالخادم لجلب البيانات...
              </p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-yellow-100 border-r-4 border-yellow-500 text-yellow-900 px-6 py-4 rounded-lg mb-8">
            <div className="flex items-center">
              <span className="text-2xl ml-3">⚠️</span>
              <p>
                <strong>تنبيه:</strong> {error} (يتم عرض بيانات تجريبية حالياً)
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-green-100 border-r-4 border-green-500 text-green-900 px-6 py-4 rounded-lg mb-8">
            <div className="flex items-center">
              <span className="text-2xl ml-3">✅</span>
              <p>
                <strong>متصل:</strong> تم جلب {pharmacies.length} صيدلية من الخادم بنجاح.
              </p>
            </div>
          </div>
        )}

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="text-4xl mb-3">🔍</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">البحث التلقائي</h3>
            <p className="text-gray-600">يقوم التطبيق تلقائيًا بجمع البيانات من المصادر الرسمية</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="text-4xl mb-3">📍</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">أقرب صيدلية</h3>
            <p className="text-gray-600">ابحث عن أقرب صيدلية حراسة بناءً على موقعك</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="text-4xl mb-3">⏰</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">تحديث يومي</h3>
            <p className="text-gray-600">البيانات يتم تحديثها تلقائياً كل يوم</p>
          </div>
        </div>

        {/* Pharmacies List */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <span className="text-green-500 ml-2">●</span>
            صيدليات الحراسة {loading && '(جاري التحميل...)'}
          </h2>

          <div className="space-y-4">
            {pharmacies.map((pharmacy, index) => (
              <div
                key={pharmacy.id || `pharmacy-${index}`}
                className="border border-gray-200 rounded-lg p-5 hover:border-blue-400 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {pharmacy.name}
                    </h3>
                    <div className="space-y-1 text-gray-600">
                      <p className="flex items-center">
                        <span className="font-semibold ml-2">📍 العنوان:</span>
                        {pharmacy.address}
                      </p>
                      <p className="flex items-center">
                        <span className="font-semibold ml-2">📞 الهاتف:</span>
                        <a href={`tel:${pharmacy.phone}`} className="text-blue-600 hover:underline">
                          {pharmacy.phone}
                        </a>
                      </p>
                      {pharmacy.day && (
                        <p className="flex items-center">
                          <span className="font-semibold ml-2">📅 يوم الحراسة:</span>
                          {pharmacy.day}
                        </p>
                      )}
                    </div>
                  </div>
                  <button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors">
                    الاتجاهات
                  </button>
                </div>
              </div>
            ))}

            {!loading && pharmacies.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                لا توجد صيدليات حراسة مسجلة حالياً.
              </div>
            )}
          </div>
        </div>

        {/* API Endpoints Info */}
        <div className="mt-12 bg-gray-50 rounded-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">📡 المميزات التقنية</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="bg-white p-4 rounded border border-gray-200">
              <div className="font-bold text-gray-700 mb-2">Frontend</div>
              <ul className="space-y-1 text-gray-600">
                <li>✓ Next.js 16 مع React 19</li>
                <li>✓ Tailwind CSS للتصميم</li>
                <li>✓ TypeScript</li>
              </ul>
            </div>
            <div className="bg-white p-4 rounded border border-gray-200">
              <div className="font-bold text-gray-700 mb-2">Backend</div>
              <ul className="space-y-1 text-gray-600">
                <li>✓ Node.js + Express</li>
                <li>✓ Firebase Realtime Database</li>
                <li>✓ Web Scraping تلقائي</li>
                <li>✓ API RESTful</li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white mt-16 py-6">
        <div className="container mx-auto px-4 text-center">
          <p>🏥 تطبيق صيدليات الحراسة - طنجة</p>
          <p className="text-sm text-gray-400 mt-2">
            Tangier Pharmacy Guard Application
          </p>
        </div>
      </footer>
    </div>
  );
}
