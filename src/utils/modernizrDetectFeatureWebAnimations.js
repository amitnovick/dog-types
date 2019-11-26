const isSupported = () => "animate" in document.createElement("div");

export default isSupported;
