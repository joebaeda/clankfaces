import { clankFacesAbi, clankFacesAddress } from '@/lib/clankfaces';
import { ImageResponse } from 'next/og';
import { createPublicClient, http } from 'viem';
import { base } from 'viem/chains';

export const runtime = 'edge';

// Helper to decode Base64 tokenURI and extract the token data
const decodeTokenURI = (base64Uri: string) => {
  try {
    const json = JSON.parse(atob(base64Uri.split(',')[1]));
    return {
      imageUri: json.image || '',
      cfOwnerFid: json.attributes?.find(
        (attr: { trait_type: string }) => attr.trait_type === 'Farcaster ID'
      )?.value || '',
    };
  } catch (error) {
    console.error('Error decoding Base64 tokenURI:', error);
    return { imageUri: '', cfOwnerFid: '' };
  }
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tokenId = searchParams.get('tokenId');

  if (!tokenId) {
    return new ImageResponse(
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          height: '100%',
          backgroundImage: 'url(https://clankfaces.com/og-image.jpg)',
          objectFit: 'cover',
          backgroundColor: '#f4f4f5',
          fontSize: 24,
          color: '#333',
        }}
      >
      </div>,
      { width: 1200, height: 600 }
    );
  }

  const publicClient = createPublicClient({
    chain: base,
    transport: http(),
  });

  try {
    const tokenURI: string = await publicClient.readContract({
      address: clankFacesAddress as `0x${string}`,
      abi: clankFacesAbi,
      functionName: 'tokenURI',
      args: [BigInt(tokenId)],
    });

    const { imageUri, cfOwnerFid } = decodeTokenURI(tokenURI);

    if (!imageUri || !cfOwnerFid) {
      throw new Error('Invalid tokenURI format');
    }

    const response = await fetch(`https://hub.pinata.cloud/v1/userDataByFid?fid=${cfOwnerFid}`)
    if (!response.ok) {
      throw new Error(`Failed to fetch user data: ${response.statusText}`)
    }

    const userData = await response.json()

    // Initialize extracted data fields
    //let name = ""
    //let fname = ""
    //let bio = ""
    let pfp = ""

    // Extract relevant fields
    for (const message of userData.messages) {
      const { type, value } = message.data.userDataBody
      //if (type === "USER_DATA_TYPE_DISPLAY") name = value
      //if (type === "USER_DATA_TYPE_USERNAME") fname = value
      //if (type === "USER_DATA_TYPE_BIO") bio = value
      if (type === "USER_DATA_TYPE_PFP") pfp = value
    }

    return new ImageResponse(
      <div
        style={{
          position: 'relative',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          height: '100%',
          backgroundColor: '#d1bae0',
          backgroundSize: '30px 30px',
          background: 'radial-gradient(#c7a9db 10%, transparent 10%)',
          fontFamily: 'Arial, sans-serif',
          color: 'white',
          padding: '30px',
        }}
      >
        <div style={{
          position: 'absolute',
          top: '18%',
          left: '20%',
          backgroundImage: `url(${pfp || 'https://clankfaces.com/icon.png'})`,
          objectFit: 'contain',
          borderRadius: '30px',
          backgroundRepeat: 'no-repeat',
          width: '400px',
          height: '400px',
          transform: 'rotate(15deg)'
        }}></div>
        <div style={{
          position: 'absolute',
          top: '18%',
          right: '20%',
          backgroundImage: `url(${imageUri.replace("ipfs://", "https://ipfs.io/ipfs/") || 'https://clankfaces.com/icon.png'})`,
          objectFit: 'contain',
          borderRadius: '30px',
          backgroundRepeat: 'no-repeat',
          width: '400px',
          height: '400px',
          transform: 'rotate(-15deg)'
        }}></div>
        </div>,
      { width: 1200, height: 600 }
    );
  } catch (error) {
    console.error('Error generating image:', error);
    return new ImageResponse(
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          height: '100%',
          backgroundImage: 'url(https://clankfaces.com/og-image.jpg)',
          objectFit: 'cover',
          backgroundColor: '#f8d7da',
          fontSize: 24,
          color: '#842029',
        }}
      >
      </div>,
      { width: 1200, height: 600 }
    );
  }
}
