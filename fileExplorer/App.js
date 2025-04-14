import React from "react"
import { FileSystemProvider } from "./context/FileSystemContext"
import Main from "./main"

const App = () => {
	return <FileSystemProvider>
		<Main />
	</FileSystemProvider>
}

export default App
