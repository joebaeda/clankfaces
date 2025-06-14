export async function GET() {

  const config = {
    accountAssociation: {
      header: "eyJmaWQiOjEwMTU2MzUsInR5cGUiOiJjdXN0b2R5Iiwia2V5IjoiMHhGQTZDZTk0QTM4MzQ2REU2QzgzZjkyMjI2ZTc1ODliNjI2YmZCMTVBIn0",
      payload: "eyJkb21haW4iOiJjbGFua2ZhY2VzLmNvbSJ9",
      signature: "MHhlODcxMDNlN2UzYWVmYWYxMzVkZjE5ZTkzODE1NTAyMWU0ZGI2MDA4ZmQ3ZjUzYjYyODlmNzVkYjk0YjBiNTBjMjU2NmNlNGVkNWQ0MjkxYjBkN2U2NjBlYWViNmExOWVmMjRiMzVhM2I4OWQxNTkxMWViODgxYTE2MWNlNGNhNDFj"
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