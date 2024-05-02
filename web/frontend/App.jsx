import { BrowserRouter } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { NavigationMenu } from "@shopify/app-bridge-react";
import MyPlanProvider from "./components/providers/PlanProvider";

import Routes from "./Routes";

import {
  AppBridgeProvider,
  QueryProvider,
  PolarisProvider,
} from "./components";

export default function App() {
  // Any .tsx or .jsx files in /pages will become a route
  // See documentation for <Routes /> for more info
  const pages = import.meta.globEager("./pages/**/!(*.test.[jt]sx)*.([jt]sx)");
  const { t } = useTranslation();

  return (
    <PolarisProvider>
      <BrowserRouter>
        <AppBridgeProvider>
          <QueryProvider>
            <MyPlanProvider>
            <NavigationMenu
              navigationLinks={[
                {
                  label: ("Details"),
                  destination: "/details/",
                },
                {
                  label: ("Product"),
                  destination: "/product/",
                },
                {
                  label: ("Settings"),
                  destination: "/settings",
                },
                {
                  label: ("Pricing Plans"),
                  destination: "/plan",
                },
                {
                  label: ("Support"),
                  destination: "/support",
                },
              ]}
            />
            <Routes pages={pages} />
            </MyPlanProvider>
          </QueryProvider>
        </AppBridgeProvider>
      </BrowserRouter>
    </PolarisProvider>
  );
}
