function AuthLayout({
  title,
  children,
}) {
  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center">

      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">

        <h1 className="text-3xl font-bold text-center mb-8">
          {title}
        </h1>

        {children}

      </div>

    </div>
  );
}

export default AuthLayout;