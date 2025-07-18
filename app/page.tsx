export default function HomePage() {
  // This is the main entry point for the Watch app
  // It renders a simple welcome message
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <h1>Welcome to the Watch App</h1>
        <p>Your personalized movie and show tracking tool.</p>
      </main>
    </div>
  );
}
// This page serves as the main entry point for the application
// It displays a welcome message and basic information about the app