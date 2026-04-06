export default function FormContainer({ children, onSubmit, title, icon }) {
  return (
    <div className="bg-white dark:bg-black text-gray-900 dark:text-white mx-auto p-8 mt-10 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800">
      <h2 className="text-2xl font-bold flex items-center gap-2 mb-6">
        {icon} {title}
      </h2>
      <form onSubmit={onSubmit} className="space-y-5">{children}</form>
    </div>
  );
}