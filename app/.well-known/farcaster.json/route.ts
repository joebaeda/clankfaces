export async function GET() {

  const config = {
    accountAssociation: {
      header: "eyJmaWQiOjg5MTkxNCwidHlwZSI6ImN1c3RvZHkiLCJrZXkiOiIweDRmYzg1YjUzN2FkYzE4RmYzNTRhMzJDNkUxM0JCRGNEZDk0YTZEMDEifQ",
      payload: "eyJkb21haW4iOiJjbGFua2ZhY2VzLmNvbSJ9",
      signature: "MHgxYjQ4NGYwMDdkNmEwZDAzNDM2YzMyY2JiNTJmMzVlZDVlZTMxOWZkMDAyODQ1Mjk2Y2Q3NjQzNjY3ZmQ3NWYwMjhjYzI1YmVjODJjNDE2OTM3NzAwYTRlNTM5NGRhM2M2NTNmZjgyZjRiNDk0NzhmOTUwN2ZjMTRjN2M3NzE2NTFi"
    },
    frame: {
      version: "1",
      name: "Clank Faces",
      iconUrl: "https://clankfaces.com/icon.png",
      homeUrl: "https://clankfaces.com",
      imageUrl: "https://clankfaces.com/og-image.jpg",
      buttonTitle: "Mint your CLANKFACES!",
      splashImageUrl: "https://clankfaces.com/splash.png",
      splashBackgroundColor: "#1b1423",
      webhookUrl: "https://clankfaces.com/api/webhook"
    },
  };

  return Response.json(config);
}