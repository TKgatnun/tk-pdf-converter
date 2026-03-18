Dont you just hate it when you have a bunch of files to convert to pdf but can only convert one at a time or pay for a premium.
Worry no more, Captain save a ho to the rescue
For this build i used React + vite + javascript for a minimalistic ui so you dont have to type the commands on terminal which was hectic asf btw and required somewhat memorising the commands which has its aura but c'mon.
Hosted my middleware on Render FastAPI for speed to handle the CORS and secure routing.
And finally my engine which takes tools from libreOffice by Gotenberg(docker)
Data Flow:Client ➔ React UI ➔ FastAPI Proxy ➔ Gotenberg Engine ➔ Client
