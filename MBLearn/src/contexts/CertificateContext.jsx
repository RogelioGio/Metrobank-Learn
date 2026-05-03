import { createContext, useContext, useState } from "react";

const CertificateContext = createContext({
    certificate: {},
    setCertificate: () => {},
});

export const CertificateProvider = ({children}) => {
    const [certificate, _setCertificate] = useState(null);

    const setCertificate = (c) => {
        _setCertificate(c);
    }

    return (
        <CertificateContext.Provider value={{certificate, setCertificate}}>
            {children}
        </CertificateContext.Provider>
    )
}

export const useCertificate = () => useContext(CertificateContext);
