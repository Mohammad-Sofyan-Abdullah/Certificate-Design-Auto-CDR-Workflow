import CertificateForm from '@/components/CertificateForm';

export default function Home() {
  return (
    <main className="min-h-screen py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <header className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-800">
            Spectrum - The Schooling Zone
          </h1>
          <p className="text-gray-500">School Leaving Certificate Generator</p>
        </header>
        <CertificateForm />
      </div>
    </main>
  );
}
