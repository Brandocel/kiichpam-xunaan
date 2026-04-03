import type {
    ProposalGalleryItem,
    ProposalGalleryResponse,
    ProposalHeroResponse,
    ProposalHeroSlide,
    ProposalPackageItem,
    ProposalPackagesResponse,
  } from "../types/proposal.types";
  
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
  
  export async function getProposalHeroSlides(): Promise<ProposalHeroSlide[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/proposal/hero/slides`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      });
  
      if (!response.ok) {
        console.error("PROPOSAL HERO STATUS ERROR:", response.status);
        return [];
      }
  
      const result: ProposalHeroResponse = await response.json();
  
      if (!result.success || !Array.isArray(result.data)) {
        return [];
      }
  
      return result.data
        .filter((slide) => slide.isActive)
        .sort((a, b) => a.order - b.order);
    } catch (error) {
      console.error("GET PROPOSAL HERO ERROR:", error);
      return [];
    }
  }
  
  export async function getProposalPackages(
    lang: "es" | "en"
  ): Promise<ProposalPackageItem[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/proposal/packages?lang=${lang}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      });
  
      if (!response.ok) {
        console.error("PROPOSAL PACKAGES STATUS ERROR:", response.status);
        return [];
      }
  
      const result: ProposalPackagesResponse = await response.json();
  
      if (!result.success || !Array.isArray(result.data)) {
        return [];
      }
  
      return result.data
        .filter((item) => item.isActive)
        .sort((a, b) => a.order - b.order);
    } catch (error) {
      console.error("GET PROPOSAL PACKAGES ERROR:", error);
      return [];
    }
  }
  
  export async function getProposalGallery(
    lang: "es" | "en"
  ): Promise<ProposalGalleryItem[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/proposal/gallery?lang=${lang}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      });
  
      if (!response.ok) {
        console.error("PROPOSAL GALLERY STATUS ERROR:", response.status);
        return [];
      }
  
      const result: ProposalGalleryResponse = await response.json();
  
      if (!result.success || !Array.isArray(result.data)) {
        return [];
      }
  
      return result.data
        .filter((item) => item.isActive)
        .sort((a, b) => a.order - b.order);
    } catch (error) {
      console.error("GET PROPOSAL GALLERY ERROR:", error);
      return [];
    }
  }