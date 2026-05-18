import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";

export interface AgreementParty {
  label: string;
  name?: string;
  phone?: string;
}

export interface AgreementTerm {
  label: string;
  value?: string;
}

interface PrintableAgreementProps {
  documentTitle: string;
  date: Date;
  terms: AgreementTerm[];
  termsText: string;
  signatures: AgreementParty[];
}

const PrintableAgreement = ({
  documentTitle,
  date,
  terms,
  termsText,
  signatures,
}: PrintableAgreementProps) => {
  const { t } = useTranslation();

  // Portaled to document.body so the global print CSS rule
  // `body > *:not(.printable-agreement) { display: none }` can isolate it
  // from the rest of the app (including the open <dialog> modal).
  return createPortal(
    <div className="printable-agreement hidden bg-white text-black print:block">
      <header className="mb-6 border-b border-black pb-4 text-center">
        <h1 className="text-3xl font-bold">{t("agreement.title")}</h1>
        <p className="text-sm italic">{t("agreement.subtitle")}</p>
      </header>

      <div className="mb-6 flex items-baseline justify-between">
        <h2 className="text-xl font-semibold">{documentTitle}</h2>
        <div className="text-sm">
          <span className="font-semibold">{t("agreement.date")}: </span>
          {date.toLocaleDateString()}
        </div>
      </div>

      <table className="mb-6 w-full text-sm">
        <tbody>
          {terms.map((term) => (
            <tr key={term.label} className="border-b border-gray-400">
              <td className="w-1/3 border-e border-dashed py-2 align-top font-semibold">
                {term.label}
              </td>
              <td className="p-2">{term.value ?? ""}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="mb-10 text-justify text-sm leading-relaxed">{termsText}</p>

      <div className="mt-12 grid grid-cols-2 gap-x-12 gap-y-12">
        {signatures.map((party) => (
          <div key={party.label}>
            <div className="h-10 border-b border-black" />
            <p className="mt-1 text-sm font-semibold">{party.label}</p>
            {party.name && <p className="text-xs">{party.name}</p>}
            {party.phone && <p className="text-xs">{party.phone}</p>}
          </div>
        ))}
      </div>

      <footer className="mt-16 border-t border-black pt-3 text-center text-xs">
        {t("agreement.footer")} © {date.getFullYear()}
      </footer>
    </div>,
    document.body,
  );
};

export default PrintableAgreement;
