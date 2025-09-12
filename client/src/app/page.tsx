import { KnockBankLogo } from "@/components/knock-bank-logo";
import { LoginForm } from "@/modules/auth/components/login-form";
import { CreateAccountForm } from "@/modules/account/components/create-account-form";

// This is the main component for the homepage.
export default function HomePage() {
  return (
    <div className="bg-white h-screen flex flex-col">
      <Header />
      <Hero />
    </div>
  );
}

// Sub-component for the page header.
function Header() {
  return (
    <header className="container m-auto flex justify-between items-center py-4">
      <div id="logo" className="flex items-center gap-4 text-2xl font-bold">
        <KnockBankLogo size={64} />
        <span>KnockBank</span>
      </div>
      <LoginForm />
    </header>
  );
}

// Sub-component for the main "hero" section.
function Hero() {
  return (
    <main className="container m-auto flex flex-col flex-grow justify-center gap-8">
      {/* --- TEXT TRANSLATED FROM PORTUGUESE --- */}
      <h1 className="text-5xl font-extrabold lg:max-w-lg">
        Always delivering a <strong>Knock Out</strong> to your debts
      </h1>
      <p className="text-justify text-2xl lg:max-w-lg">
        Come to the bank that makes transfers easiest.
        Before you know it, the money is already knocking at your door.
      </p>
      {/* --- END OF TRANSLATED TEXT --- */}
      <CreateAccountForm />
    </main>
  );
}