# ─────────────────────────────────────────────────────────────────────────────
# Stage 1 — Build Angular
#   node:22-alpine is small and fast
#   angular.json writes output to "../API/wwwroot" relative to the client dir,
#   which resolves to /src/API/wwwroot inside this stage.
# ─────────────────────────────────────────────────────────────────────────────
FROM node:22-alpine AS angular-build

WORKDIR /src

# Copy package files first — Docker caches this layer so "npm ci" only
# re-runs when package-lock.json actually changes (speeds up rebuilds).
COPY client/package*.json ./client/
RUN cd client && npm ci

# Copy the rest of the Angular source, then build
COPY client/ ./client/
RUN mkdir -p API/wwwroot
RUN cd client && npx ng build --configuration production
# Output now lives at /src/API/wwwroot/


# ─────────────────────────────────────────────────────────────────────────────
# Stage 2 — Build & publish .NET 10
# ─────────────────────────────────────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS dotnet-build

WORKDIR /src/API

# Restore NuGet packages (cached separately from source code)
COPY API/*.csproj ./
RUN dotnet restore

# Copy everything else
COPY API/ ./

# Bring in the Angular build output from Stage 1
COPY --from=angular-build /src/API/wwwroot ./wwwroot

# Publish in Release mode — output goes to /publish
RUN dotnet publish -c Release -o /publish
# /publish now contains:
#   ├── API.dll  (and all .NET runtime files)
#   └── wwwroot/ (Angular SPA from Stage 1)


# ─────────────────────────────────────────────────────────────────────────────
# Stage 3 — Runtime image (much smaller than the SDK image)
# ─────────────────────────────────────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/aspnet:10.0

WORKDIR /app

COPY --from=dotnet-build /publish .

# Render passes a PORT env var. ASP.NET Core reads ASPNETCORE_HTTP_PORTS.
# Default to 8080 if PORT is not set (useful for local Docker testing).
ENV ASPNETCORE_HTTP_PORTS=8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "API.dll"]
