(() => {
    Object.defineProperty(
        window.navigator,
        'userAgent',
        {
            value: window.navigator.userAgent.replaceAll(/linux/gi, "Windows").replaceAll(/android.*?;/gi, "Windows;")
        }
    );
})();
