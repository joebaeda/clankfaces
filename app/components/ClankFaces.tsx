"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, ExternalLink, Search } from "lucide-react";
import { createPublicClient, http } from "viem";
import { base } from "viem/chains";
import Loading from "./svg/Loading";
import { clankFacesAbi, clankFacesAddress } from "@/lib/clankfaces";

// Helper to decode Base64 tokenURI and extract NFT data
const decodeTokenURI = (base64Uri: string) => {
  try {
    const json = JSON.parse(atob(base64Uri.split(",")[1]));
    return {
      clankFaceUri: json.animation_url || "",
      faceOwner: json.attributes?.find(
        (attr: { trait_type: string }) => attr.trait_type === "Face Owner"
      )?.value || "",
    };
  } catch (error) {
    console.error("Error decoding Base64 tokenURI:", error);
    return { clankFaceUri: "", faceOwner: "" };
  }
};

export default function ClankFaces() {
  const [clankFaceURIs, setClankFaceURIs] = useState<string>("");
  const [clankFaceOwner, setClankFaceOwner] = useState<string>("");
  const [tokenId, setTokenId] = useState<number>(1);
  const [maxTokenId, setMaxTokenId] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const publicClient = createPublicClient({
    chain: base,
    transport: http(),
  });

  // Fetch total supply from the contract
  const fetchTotalSupply = async () => {
    try {
      const totalSupply = await publicClient.readContract({
        address: clankFacesAddress as `0x${string}`,
        abi: clankFacesAbi,
        functionName: "totalSupply",
      });
      setMaxTokenId(Number(totalSupply));
    } catch (error) {
      console.error("Error fetching total supply:", error);
    }
  };

  // Fetch NFT data for a given tokenId
  const fetchClankFaceURL = async (tokenId: number) => {
    try {
      setIsLoading(true);
      const tokenURI = await publicClient.readContract({
        address: clankFacesAddress as `0x${string}`,
        abi: clankFacesAbi,
        functionName: "tokenURI",
        args: [BigInt(tokenId)],
      });
      const { clankFaceUri, faceOwner } = decodeTokenURI(tokenURI);
      setClankFaceURIs(clankFaceUri);
      setClankFaceOwner(faceOwner);
    } catch (error) {
      console.error("Error fetching animation URL:", error);
      setClankFaceURIs("");
      setClankFaceOwner("");
    } finally {
      setIsLoading(false);
    }
  };

  // Search for an NFT by face owner username
  const handleSearch = async () => {
    if (!searchQuery) return;

    setIsLoading(true);

    const normalizedQuery = searchQuery.startsWith("@")
      ? searchQuery.toLowerCase()
      : `@${searchQuery.toLowerCase()}`;

    for (let id = 1; id <= maxTokenId; id++) {
      try {
        const tokenURI = await publicClient.readContract({
          address: clankFacesAddress as `0x${string}`,
          abi: clankFacesAbi,
          functionName: "tokenURI",
          args: [BigInt(id)],
        });
        const { faceOwner } = decodeTokenURI(tokenURI);

        if (faceOwner.toLowerCase() === normalizedQuery) {
          setTokenId(id);
          setIsLoading(false);
          return; // Exit once found
        }
      } catch (error) {
        console.error(`Error fetching tokenURI for token ${id}:`, error);
      }
    }
    setIsLoading(false);
    setClankFaceURIs(""); // No match found
    setClankFaceOwner(normalizedQuery);
  };

  // Initialize component: fetch total supply and handle query parameter
  useEffect(() => {
    const initialize = async () => {
      await fetchTotalSupply(); // Fetch maxTokenId first
    };
    initialize();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch animation URL when tokenId or maxTokenId changes
  useEffect(() => {
    if (maxTokenId > 0) {
      fetchClankFaceURL(tokenId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokenId, maxTokenId]);

  // Navigation handlers
  const handlePrev = () => {
    setTokenId((prev) => (prev > 1 ? prev - 1 : prev));
  };

  const handleNext = () => {
    setTokenId((prev) => (prev < maxTokenId ? prev + 1 : prev));
  };

  return (
    <main className="w-full bg-[#08060ce3] min-h-screen bg-[radial-gradient(#290f51_1px,transparent_1px)] [background-size:16px_16px] flex flex-col items-center justify-center">
      {/* Top Navigation and Search */}
      <div className="fixed max-w-[384px] mx-auto z-10 top-0 flex justify-center w-full p-4 items-center">
        <button
          onClick={handlePrev}
          className="backdrop-blur-lg bg-slate-800 bg-opacity-50 rounded-l-full text-white p-4"
          disabled={tokenId <= 1}
        >
          <ArrowLeft className="w-6 h-6" />
        </button>

        <div className="w-full relative flex justify-center items-center">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="by username"
            className="relative placeholder:text-sm w-full backdrop-blur-md bg-slate-800 bg-opacity-50 p-4 focus:outline-none text-white"
          />
          <button
            onClick={handleSearch}
            className="absolute text-white right-4 flex items-center z-20"
          >
            <Search className="w-5 h-5" />
          </button>
        </div>

        <button
          onClick={handleNext}
          className="backdrop-blur-lg bg-slate-800 bg-opacity-50 rounded-r-full text-white p-4"
          disabled={tokenId >= maxTokenId}
        >
          <ArrowRight className="w-6 h-6" />
        </button>
      </div>

      {/* NFT Display */}
      <div className="relative w-full h-full flex items-center justify-center">
        {isLoading ? (
          <div className="absolute z-0 inset-0 flex max-w-[300px] mx-auto justify-center items-center text-gray-500 text-center">
            <div className="absolute animate-spin rounded-full h-32 w-32 border-t-4 border-b-4 border-purple-500"></div>
            <Loading className="rounded-full h-28 w-28" />
          </div>
        ) : clankFaceURIs ? (
          <iframe
            src={clankFaceURIs}
            className="w-full h-screen"
            allowFullScreen
            title={`Face of Farcaster Art by ${clankFaceOwner}`}
          ></iframe>
        ) : (
          <div className="absolute inset-0 flex max-w-[300px] mx-auto justify-center items-center text-gray-500 text-center">
            No Clankers Face Art found for this creator!
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed max-w-[384px] mx-auto bottom-0 flex justify-center items-center w-full p-4">
        <button
          onClick={handlePrev}
          className="backdrop-blur-lg bg-slate-800 bg-opacity-50 rounded-l-full text-white p-4"
          disabled={tokenId <= 1}
        >
          <ArrowLeft className="w-6 h-6" />
        </button>

        <div className="w-full relative h-14 flex flex-row backdrop-blur-md bg-slate-800 bg-opacity-50 justify-center items-center space-x-0">
          {clankFaceURIs && (
            <a
              href={clankFaceURIs}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full p-4 text-white hover:h-14 hover:bg-gray-600 flex items-center space-x-2"
            >
              <ExternalLink className="w-5 h-5" />
              <span className="text-xs">Origin</span>
            </a>
          )}
          {clankFaceURIs && (
            <a
              href={`https://opensea.io/item/base/${clankFacesAddress}/${tokenId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full p-4 text-white hover:h-14 hover:bg-gray-600 flex items-center space-x-2"
            >
              <ExternalLink className="w-5 h-5" />
              <span className="text-xs">Collect</span>
            </a>
          )}
        </div>

        <button
          onClick={handleNext}
          className="backdrop-blur-lg bg-slate-800 bg-opacity-50 rounded-r-full text-white p-4"
          disabled={tokenId >= maxTokenId}
        >
          <ArrowRight className="w-6 h-6" />
        </button>
      </div>
    </main>
  );
}