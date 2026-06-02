import { router, usePathname } from "expo-router";
import { useCallback } from "react";

function isProductRoute(pathname: string) {
  return pathname.startsWith("/product/");
}

function isCreateRoute(pathname: string) {
  return pathname === "/camera" || pathname === "/capture-preview";
}

export function useCatalogNavigation() {
  const pathname = usePathname();

  const openCreateProduct = useCallback((sku?: string) => {
    if (isCreateRoute(pathname)) return;

    const route = sku ? { pathname: "/camera" as const, params: { sku, returnToProduct: "1" } } : "/camera";

    router.push(route);
  }, [pathname]);

  const openProductDetail = useCallback((sku: string) => {
    const route = { pathname: "/product/[sku]" as const, params: { sku } };

    if (isProductRoute(pathname) || isCreateRoute(pathname)) {
      router.replace(route);
      return;
    }

    router.push(route);
  }, [pathname]);

  return { openCreateProduct, openProductDetail };
}
