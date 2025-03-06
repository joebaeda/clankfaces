"use client";

import { useReadContract } from "wagmi";
import { use, useCallback, useEffect, useState } from "react";
import sdk from '@farcaster/frame-sdk';
import { ArrowBigLeft } from "lucide-react";
import { clankFacesAbi, clankFacesAddress } from "@/lib/clankfaces";

// Helper to decode Base64 tokenURI and extract the token data
const decodeTokenURI = (base64Uri: string) => {
    try {
        const json = JSON.parse(atob(base64Uri.split(",")[1]));
        return {
            clankFacesHTML: json.animation_url || "",
            clankFacesOwner: json.attributes?.find(
                (attr: { trait_type: string }) => attr.trait_type === 'Face Owner'
            )?.value || '',
            cfOwnerFID: json.attributes?.find(
                (attr: { trait_type: string }) => attr.trait_type === 'Farcaster ID'
            )?.value || '',
        };
    } catch (error) {
        console.error("Error decoding Base64 tokenURI:", error);
        return { clankFacesHTML: "", clankFacesOwner: "", cfOwnerFID: "" };
    }
};


export default function TokenDetails({
    params,
}: {
    params: Promise<{ tokenId: string }>
}) {
    const { tokenId } = use(params)
    const [facesHTML, setFacesHTML] = useState<string>("");
    const [facesOwnerFID, setFacesOwnerFID] = useState<number>();
    const [facesOwnerName, setFacesOwnerName] = useState<string>("");

    const { data: tokenURIData } = useReadContract({
        address: clankFacesAddress as `0x${string}`,
        abi: clankFacesAbi,
        functionName: "tokenURI",
        args: [BigInt(tokenId)],
    });

    const viewAuthorProfile = useCallback((fid?: number) => {
        if (fid) {
            sdk.actions.viewProfile({ fid });
        }
    }, [])

    useEffect(() => {
        if (tokenURIData) {
            const { clankFacesHTML, clankFacesOwner, cfOwnerFID } = decodeTokenURI(tokenURIData);
            setFacesHTML(clankFacesHTML);
            setFacesOwnerFID(cfOwnerFID);
            setFacesOwnerName(clankFacesOwner);
        }
    }, [tokenURIData]);

    const closeFrame = () => {
        sdk.actions.close()
    };

    return (
        <main className="sm:min-h-screen bg-gray-50 min-h-[695px] bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">

            {/* Header section */}
            <div className="w-full bg-[#4f2d61] p-3 rounded-b-2xl flex flex-row justify-between">

                {/* Back */}
                <button
                    onClick={closeFrame}
                    className="disabled:opacity-50"
                >
                    <ArrowBigLeft className="w-10 h-10 text-gray-200" />
                </button>

                {/* Profile */}
                <button onClick={() => viewAuthorProfile(facesOwnerFID)} className="flex text-white flex-row justify-between items-center gap-2">
                    By {facesOwnerName}
                </button>

            </div>

            {/* Words of the Day detail */}
            <div className="relative w-full h-full flex items-center justify-center">
                {facesHTML ? (
                    <iframe
                        src={facesHTML}
                        allow="clipboard-write"
                        className="w-full h-screen"
                        allowFullScreen
                    ></iframe>
                ) : (
                    <div className="absolute inset-0 flex max-w-[300px] mx-auto justify-center items-center text-gray-500 text-center">
                        No Clank Faces minted yet!
                    </div>
                )}
            </div>
        </main>
    );
}