import { useTranslation } from "react-i18next";

export default function Home() {
  const { t, i18n } = useTranslation();

  const changeLanguage = (lng: "en" | "es") => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="flex flex-col gap-3 justify-center items-center h-screen">
      {/* nav */}
      <div className="flex gap-2">
        <a href="/" className="text-lg underline">
          {t("home.link")}
        </a>
        <a href="/login" className="text-lg underline">
          {t("login.link")}
        </a>
      </div>

      <div className="flex gap-2">
        <button
          className="px-4 py-2 border rounded cursor-pointer"
          onClick={() => changeLanguage("en")}
        >
          English
        </button>
        <button
          className="px-4 py-2 border rounded cursor-pointer"
          onClick={() => changeLanguage("es")}
        >
          Español
        </button>
      </div>

      <h1 className="text-3xl font-bold underline">{t("home.title")}</h1>
    </div>
  );
}
