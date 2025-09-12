import { KnockBankLogo } from "@/components/knock-bank-logo";

export default function NotFoundPage() {
  return (
    <div className="flex flex-col w-screen h-screen justify-center items-center text-5xl gap-8">
      <KnockBankLogo size={256} />
      <h1> Page Not Found. </h1>
    </div>
  );
}
