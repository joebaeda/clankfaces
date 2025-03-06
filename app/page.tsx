"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "./components/ui/button";
import { useViewer } from "./providers/FrameContextProvider";
import {
  BaseError,
  useAccount,
  useBalance,
  useChainId,
  useConnect,
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { base } from "viem/chains";
import sdk from "@farcaster/frame-sdk";
import { ExternalLink, Leaf, LockKeyhole, Rocket } from "lucide-react";
import { config } from "@/lib/config";
import Loading from "./components/svg/Loading";
import { clankFacesAbi, clankFacesAddress } from "@/lib/clankfaces";
import Image from "next/image";

interface ClankFacesProps {
  faceSkinColor: string;
  faceShape: string;
  mouthExpression: string;
  background: string;
}

export default function Home() {
  const [showError, setShowError] = useState(false);
  const [showMintSuccess, setShowMintSuccess] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [clankFacesImageUri, setClankFacesImageUri] = useState<string>(""); // Fixed typo: clankFacesImageUris -> clankFacesImageUri
  const [showTermOfMint, setShowTermOfMint] = useState(false);
  const [showLoadingAnimation, setShowLoadingAnimation] = useState(false);

  // Generate Clank Faces
  const [generatedValues, setGeneratedValues] = useState<ClankFacesProps>({
    faceSkinColor: "",
    faceShape: "",
    mouthExpression: "",
    background: "",
  });
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const { username, fid, added } = useViewer();

  const chainId = useChainId();
  const { connect } = useConnect();
  const { address, isConnected } = useAccount();
  const {
    data: clankFacesHash,
    error: clankFacesError,
    isPending: isClankFacesPending,
    writeContract: clankFacesWrite,
  } = useWriteContract();

  // Generate values from Ethereum address
  useEffect(() => {
    const faceSkinColors = ['red', 'blue', 'green', 'purple', 'orange', 'brown'] as const;
    const faceShapes = ['oval', 'long', 'round', 'square', 'diamond', 'triangle'] as const;
    const mouthExpressions = ['smiling', 'laughing', 'flat', 'indifferent', 'angry', 'embarrassed'] as const;
    const backgrounds = ['#eee', '#f5f5f5', '#d3d3d3', '#b0e0e6', '#ffe4e1'] as const;

    if (address) {
      const seed = parseInt(address.slice(2, 10), 16);
      const faceSkinColor = faceSkinColors[seed % faceSkinColors.length];
      const faceShape = faceShapes[seed % faceShapes.length];
      const mouthExpression = mouthExpressions[seed % mouthExpressions.length];
      const background = backgrounds[seed % backgrounds.length];
      setGeneratedValues({ faceSkinColor, faceShape, mouthExpression, background });
      getClankFacesBlob({ faceSkinColor, faceShape, mouthExpression, background });
    } else {
      setGeneratedValues({ faceSkinColor: "purple", faceShape: "square", mouthExpression: "smiling", background: "#eee" });
      setPreviewUrl(null); // Reset preview when disconnected
    }
  }, [address]);

  const { data: tokenId } = useReadContract({
    address: clankFacesAddress as `0x${string}`,
    abi: clankFacesAbi,
    chainId: base.id,
    functionName: "totalSupply",
  });

  const { data: clankFacesBalance } = useReadContract({
    address: clankFacesAddress as `0x${string}`,
    abi: clankFacesAbi,
    chainId: base.id,
    functionName: "balanceOf",
    args: [address as `0x${string}`],
  });

  const userBalance = useBalance({
    chainId: base.id,
    address: address,
  });

  const { data: mintPrice } = useReadContract({
    address: clankFacesAddress as `0x${string}`,
    abi: clankFacesAbi,
    chainId: base.id,
    functionName: "mintPrice",
  });

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: clankFacesHash,
  });

  const linkToBaseScan = useCallback((hash?: string) => {
    if (hash) {
      sdk.actions.openUrl(`https://basescan.org/tx/${hash}`);
    }
  }, []);

  const linkToOpensea = useCallback((tokenId?: number) => {
    if (tokenId) {
      sdk.actions.openUrl(`https://opensea.io/assets/base/${clankFacesAddress}/${tokenId}`);
    }
  }, []);

  const linkToShare = useCallback((tokenId?: number) => {
    if (tokenId) {
      sdk.actions.openUrl(
        `https://warpcast.com/~/compose?text=Just%20Minted%20my%20Clank%20Faces!&embeds[]=https://clankfaces.com/${tokenId}`
      );
    }
  }, []);

  useEffect(() => {
    if (!added) {
      sdk.actions.addFrame();
    }
  }, [added]);

  useEffect(() => {
    if (isConfirmed) {
      setShowMintSuccess(true);
      setShowLoadingAnimation(false);
    }
  }, [isConfirmed]);

  useEffect(() => {
    if (clankFacesError) {
      setShowError(true);
    }
  }, [clankFacesError]);

  useEffect(() => {
    if ((clankFacesBalance as bigint) > BigInt(0)) {
      setShowTermOfMint(true);
    }
  }, [clankFacesBalance]);

  useEffect(() => {
    if (isUploading || isClankFacesPending || isConfirming) {
      setShowLoadingAnimation(true);
    } else {
      setShowLoadingAnimation(false);
    }
  }, [isConfirming, isClankFacesPending, isUploading]);

  // Fetch Clank Faces blob
  const getClankFacesBlob = async (values: ClankFacesProps): Promise<Blob | undefined> => {
    try {
      const response = await fetch('/api/clankfaces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          faceSkinColor: values.faceSkinColor,
          faceShape: values.faceShape,
          mouthExpression: values.mouthExpression,
          background: values.background,
        }),
      });
      if (!response.ok) throw new Error('Failed to fetch preview');
      const blob = await response.blob();
      setPreviewUrl(URL.createObjectURL(blob));
      return blob;
    } catch (error) {
      console.error('Error fetching preview:', error);
      return undefined;
    }
  };

  // Upload to Pinata and get IPFS hash
  const getImageHash = async (): Promise<string | undefined> => {
    setIsUploading(true);
    try {
      const clankFacesBlob = await getClankFacesBlob(generatedValues);
      if (!clankFacesBlob) throw new Error('Failed to generate blob');

      const formData = new FormData();
      formData.append("file", clankFacesBlob, `clankfaces-${fid}.png`);

      const response = await fetch("/api/pinata-upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setClankFacesImageUri(`https://ipfs.io/ipfs/${data.ipfsHash}`);
        return data.ipfsHash;
      } else {
        console.error('Pinata upload failed:', data);
        return undefined;
      }
    } catch (err) {
      console.error('Error uploading to Pinata:', err);
      return undefined;
    } finally {
      setIsUploading(false);
    }
  };

  const handleMint = async () => {

    try {
      const _imageHash = await getImageHash();
      if (!_imageHash) throw new Error('Failed to get image hash');

      clankFacesWrite({
        abi: clankFacesAbi,
        chainId: base.id,
        address: clankFacesAddress as `0x${string}`,
        functionName: "mint",
        args: [
          _imageHash,
          generatedValues.background,
          BigInt(fid || 0), // Fallback to 0 if fid is undefined
          username || "unknown", // Fallback if username is undefined
          generatedValues.faceSkinColor,
          generatedValues.faceShape,
          generatedValues.mouthExpression,
        ],
        value: mintPrice,
      });
    } catch (error) {
      console.error("Error during minting:", (error as Error).message);
      setShowError(true);
    }
  };

  const getClankFacesPreview = () => {
    const faceSkinColors = ['red', 'blue', 'green', 'purple', 'orange', 'brown'] as const;
    const faceShapes = ['oval', 'long', 'round', 'square', 'diamond', 'triangle'] as const;
    const mouthExpressions = ['smiling', 'laughing', 'flat', 'indifferent', 'angry', 'embarrassed'] as const;
    const backgrounds = ['#eee', '#f5f5f5', '#d3d3d3', '#b0e0e6', '#ffe4e1'] as const;

    if (address) {
      const seed = parseInt(address.slice(2, 10), 16);
      const faceSkinColor = faceSkinColors[seed % faceSkinColors.length];
      const faceShape = faceShapes[seed % faceShapes.length];
      const mouthExpression = mouthExpressions[seed % mouthExpressions.length];
      const background = backgrounds[seed % backgrounds.length];
      setGeneratedValues({ faceSkinColor, faceShape, mouthExpression, background });
      getClankFacesBlob({ faceSkinColor, faceShape, mouthExpression, background });
    } else {
      setGeneratedValues({ faceSkinColor: "purple", faceShape: "square", mouthExpression: "smiling", background: "#eee" });
      setPreviewUrl(null); // Reset preview when disconnected
    }
  }

  return (
    <main className="relative flex justify-center items-center w-full min-h-screen text-white">
      {previewUrl && !showMintSuccess && (
        <div className="absolute p-4 top-32 mx-auto flex items-center justify-center z-10 w-full max-w-[400px] max-h-[400px]">
          <Image
            src={previewUrl || "/icon.png"}
            width={400}
            height={400}
            alt="Clank Faces Preview"
            className="w-full h-full rounded-2xl"
          />
        </div>
      )}

      {/* Transaction Success */}
      {showMintSuccess && (
        <div
          onClick={() => setShowMintSuccess(false)}
          className="absolute top-32 mx-auto flex items-center justify-center z-30 w-full max-w-[384px] max-h-[384px]"
        >
          <div className="relative p-4 flex flex-col bg-[#17101f] text-slate-300 rounded-2xl text-center">
            <p className="text-center p-4">🎉 Mint Success 🎉</p>
            <Image
              src={clankFacesImageUri || "/icon.png"}
              width={250}
              height={250}
              alt="Clank Faces"
              className="w-full max-w-[350px] max-h-[300px] rounded-2xl"
            />
            <div className="w-full pt-4 justify-between items-center flex flex-row space-x-4">
              <button
                className="w-full p-3 rounded-xl bg-gradient-to-r from-[#201029] to-[#290f37] disabled:cursor-not-allowed"
                onClick={() => linkToBaseScan(clankFacesHash)}
              >
                Proof
              </button>
              <button
                className="w-full p-3 rounded-xl bg-gradient-to-r from-[#290f37] to-[#201029] disabled:cursor-not-allowed"
                onClick={() => linkToOpensea(Number(tokenId) + 1)}
              >
                Opensea
              </button>
              <button
                className="w-16 p-3 rounded-xl bg-gradient-to-r from-[#290f37] to-[#201029] disabled:cursor-not-allowed"
                onClick={() => linkToShare(Number(tokenId) + 1)}
              >
                <ExternalLink className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transaction Error */}
      {showError && clankFacesError && (
        <div
          onClick={() => setShowError(false)}
          className="absolute top-1/4 mx-auto flex items-center justify-center p-4 z-10 w-full max-w-[90%] md:max-w-[384px] max-h-[384px]"
        >
          <div className="relative bg-[#230b36cc] bg-opacity-25 backdrop-blur-[10px] text-slate-300 p-6 rounded-2xl shadow-lg text-center">
            <p className="text-center p-4">
              Error: {(clankFacesError as BaseError).shortMessage || clankFacesError.message}
            </p>
          </div>
        </div>
      )}

      {/* Term of Mint */}
      {showTermOfMint && (
        <div
          onClick={() => setShowTermOfMint(false)}
          className="absolute top-1/4 mx-auto flex items-center justify-center p-4 z-10 w-full max-w-[90%] md:max-w-[384px] max-h-[384px]"
        >
          <div className="relative bg-[#230b36cc] bg-opacity-25 backdrop-blur-[10px] text-slate-300 p-6 rounded-2xl shadow-lg text-center">
            <p className="text-center p-4">
              One FID or one Address only one Clank Faces can be Minted.
            </p>
          </div>
        </div>
      )}

      {/* Loading State */}
      {showLoadingAnimation && (
        <div className="absolute bottom-16 w-full flex items-center justify-center z-10">
          <div className="relative">
            <Loading className="w-40 h-40" />
          </div>
        </div>
      )}

      {/* Navbar Top */}
      <div className="fixed flex justify-center items-center w-full h-28 max-w-[400px] mx-auto z-20 top-0">

        {/* Generate Clank Faces */}
        <div className="bg-black bg-opacity-25 rounded-2xl w-40 h-16 mx-auto flex items-center justify-center">
          <Button onClick={getClankFacesPreview} className="font-extrabold font-sans"><span className="pr-5">CLANK IT!</span><span className="relative bg-purple-950 w-4 h-4 rounded-full animate-ping" /></Button>
        </div>

        {/* Live Badge */}
        <div className="bg-black bg-opacity-25 rounded-2xl w-40 h-16 mx-auto flex flex-row space-x-4 items-center justify-center">
          <span className="relative bg-cyan-500 w-4 h-4 rounded-full animate-ping" />
          <span className="font-extrabold font-sans pl-3">L I V E</span>
        </div>

      </div>

      {/* Navbar Bottom */}
      <div className="fixed flex justify-center items-center w-full h-20 max-w-[400px] mx-auto z-20 bottom-0 rounded-t-2xl bg-[#17101f]">
        <div className="absolute flex justify-center items-center p-4 bottom-0 max-w-52 h-28 mx-auto rounded-t-full bg-[#17101f]">
          {isConnected && chainId === base.id ? (
            <Button
              onClick={handleMint}
              disabled={
                !isConnected ||
                isUploading ||
                isClankFacesPending ||
                isConfirming ||
                showTermOfMint ||
                chainId !== base.id ||
                (clankFacesBalance as bigint) > BigInt(0) ||
                Number(userBalance.data?.value) < Number(mintPrice)
              }
              className="w-full p-4"
            >
              {isUploading || isClankFacesPending || isConfirming ? (
                <Rocket className="w-8 h-8 animate-bounce" />
              ) : (
                <Leaf className="w-14 h-14" />
              )}
            </Button>
          ) : (
            <Button
              className="w-full p-4"
              onClick={() => connect({ connector: config.connectors[0] })}
            >
              <LockKeyhole className="w-14 h-14" />
            </Button>
          )}
        </div>
      </div>
    </main>
  );
}