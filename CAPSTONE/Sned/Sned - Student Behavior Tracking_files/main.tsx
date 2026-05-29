import { createHotContext as __vite__createHotContext } from "/@vite/client";import.meta.hot = __vite__createHotContext("/src/main.tsx");import * as RefreshRuntime from "/@react-refresh";
const inWebWorker = typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope;

import __vite__cjsImport1_react_jsxDevRuntime from "/node_modules/.vite/deps/react_jsx-dev-runtime.js?v=a07ebfa4"; const _jsxDEV = __vite__cjsImport1_react_jsxDevRuntime["jsxDEV"];
import __vite__cjsImport2_react from "/node_modules/.vite/deps/react.js?v=a07ebfa4"; const React = __vite__cjsImport2_react.__esModule ? __vite__cjsImport2_react.default : __vite__cjsImport2_react; const Component = __vite__cjsImport2_react["Component"];
import __vite__cjsImport3_reactDom_client from "/node_modules/.vite/deps/react-dom_client.js?v=a07ebfa4"; const createRoot = __vite__cjsImport3_reactDom_client["createRoot"];
import App from "/src/App.tsx?t=1776525421838";
import "/src/index.css?t=1776525421838";
class ErrorBoundary extends Component {
    static getDerivedStateFromError() {
        return {
            hasError: true
        };
    }
    componentDidCatch(error, errorInfo) {
        console.error("React Error Boundary caught an error:", error, errorInfo);
    }
    render() {
        if (this.state.hasError) {
            return /*#__PURE__*/ _jsxDEV("div", {
                style: {
                    padding: '2rem',
                    textAlign: 'center',
                    color: 'red'
                },
                children: [
                    /*#__PURE__*/ _jsxDEV("h1", {
                        children: "Something went wrong."
                    }, void 0, false, {
                        fileName: "C:/Users/kille/OneDrive/Desktop/CAPSTONE/Sned/src/main.tsx",
                        lineNumber: 17,
                        columnNumber: 82
                    }, this),
                    /*#__PURE__*/ _jsxDEV("p", {
                        children: "Check the browser console for the full error details."
                    }, void 0, false, {
                        fileName: "C:/Users/kille/OneDrive/Desktop/CAPSTONE/Sned/src/main.tsx",
                        lineNumber: 17,
                        columnNumber: 112
                    }, this)
                ]
            }, void 0, true, {
                fileName: "C:/Users/kille/OneDrive/Desktop/CAPSTONE/Sned/src/main.tsx",
                lineNumber: 17,
                columnNumber: 14
            }, this);
        }
        return this.props.children;
    }
    constructor(props){
        super(props);
        this.state = {
            hasError: false
        };
    }
}
const rootElement = document.getElementById("root");
if (rootElement) {
    console.log("Mounting application...");
    createRoot(rootElement).render(/*#__PURE__*/ _jsxDEV(React.StrictMode, {
        children: /*#__PURE__*/ _jsxDEV(ErrorBoundary, {
            children: /*#__PURE__*/ _jsxDEV(App, {}, void 0, false, {
                fileName: "C:/Users/kille/OneDrive/Desktop/CAPSTONE/Sned/src/main.tsx",
                lineNumber: 30,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "C:/Users/kille/OneDrive/Desktop/CAPSTONE/Sned/src/main.tsx",
            lineNumber: 29,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "C:/Users/kille/OneDrive/Desktop/CAPSTONE/Sned/src/main.tsx",
        lineNumber: 28,
        columnNumber: 5
    }, this));
} else {
    console.error("Critical Error: Root element #root not found in index.html");
}


if (import.meta.hot && !inWebWorker) {
  RefreshRuntime.__hmr_import(import.meta.url).then((currentExports) => {
    RefreshRuntime.registerExportsForReactRefresh("C:/Users/kille/OneDrive/Desktop/CAPSTONE/Sned/src/main.tsx", currentExports);
    import.meta.hot.accept((nextExports) => {
      if (!nextExports) return;
      const invalidateMessage = RefreshRuntime.validateRefreshBoundaryAndEnqueueUpdate("C:/Users/kille/OneDrive/Desktop/CAPSTONE/Sned/src/main.tsx", currentExports, nextExports);
      if (invalidateMessage) import.meta.hot.invalidate(invalidateMessage);
    });
  });
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1haW4udHN4Il0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBSZWFjdCwgeyBDb21wb25lbnQsIEVycm9ySW5mbywgUmVhY3ROb2RlIH0gZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgeyBjcmVhdGVSb290IH0gZnJvbSBcInJlYWN0LWRvbS9jbGllbnRcIjtcbmltcG9ydCBBcHAgZnJvbSBcIi4vQXBwXCI7XG5pbXBvcnQgXCIuL2luZGV4LmNzc1wiO1xuXG5jbGFzcyBFcnJvckJvdW5kYXJ5IGV4dGVuZHMgQ29tcG9uZW50PHsgY2hpbGRyZW46IFJlYWN0Tm9kZSB9LCB7IGhhc0Vycm9yOiBib29sZWFuIH0+IHtcbiAgY29uc3RydWN0b3IocHJvcHM6IHsgY2hpbGRyZW46IFJlYWN0Tm9kZSB9KSB7XG4gICAgc3VwZXIocHJvcHMpO1xuICAgIHRoaXMuc3RhdGUgPSB7IGhhc0Vycm9yOiBmYWxzZSB9O1xuICB9XG4gIHN0YXRpYyBnZXREZXJpdmVkU3RhdGVGcm9tRXJyb3IoKSB7IHJldHVybiB7IGhhc0Vycm9yOiB0cnVlIH07IH1cbiAgY29tcG9uZW50RGlkQ2F0Y2goZXJyb3I6IEVycm9yLCBlcnJvckluZm86IEVycm9ySW5mbykge1xuICAgIGNvbnNvbGUuZXJyb3IoXCJSZWFjdCBFcnJvciBCb3VuZGFyeSBjYXVnaHQgYW4gZXJyb3I6XCIsIGVycm9yLCBlcnJvckluZm8pO1xuICB9XG4gIHJlbmRlcigpIHtcbiAgICBpZiAodGhpcy5zdGF0ZS5oYXNFcnJvcikge1xuICAgICAgcmV0dXJuIDxkaXYgc3R5bGU9e3sgcGFkZGluZzogJzJyZW0nLCB0ZXh0QWxpZ246ICdjZW50ZXInLCBjb2xvcjogJ3JlZCcgfX0+PGgxPlNvbWV0aGluZyB3ZW50IHdyb25nLjwvaDE+PHA+Q2hlY2sgdGhlIGJyb3dzZXIgY29uc29sZSBmb3IgdGhlIGZ1bGwgZXJyb3IgZGV0YWlscy48L3A+PC9kaXY+O1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5wcm9wcy5jaGlsZHJlbjtcbiAgfVxufVxuXG5jb25zdCByb290RWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicm9vdFwiKTtcblxuaWYgKHJvb3RFbGVtZW50KSB7XG4gIGNvbnNvbGUubG9nKFwiTW91bnRpbmcgYXBwbGljYXRpb24uLi5cIik7XG4gIGNyZWF0ZVJvb3Qocm9vdEVsZW1lbnQpLnJlbmRlcihcbiAgICA8UmVhY3QuU3RyaWN0TW9kZT5cbiAgICAgIDxFcnJvckJvdW5kYXJ5PlxuICAgICAgICA8QXBwIC8+XG4gICAgICA8L0Vycm9yQm91bmRhcnk+XG4gICAgPC9SZWFjdC5TdHJpY3RNb2RlPlxuICApO1xufSBlbHNlIHtcbiAgY29uc29sZS5lcnJvcihcIkNyaXRpY2FsIEVycm9yOiBSb290IGVsZW1lbnQgI3Jvb3Qgbm90IGZvdW5kIGluIGluZGV4Lmh0bWxcIik7XG59XG4iXSwibmFtZXMiOlsiUmVhY3QiLCJDb21wb25lbnQiLCJjcmVhdGVSb290IiwiQXBwIiwiRXJyb3JCb3VuZGFyeSIsImdldERlcml2ZWRTdGF0ZUZyb21FcnJvciIsImhhc0Vycm9yIiwiY29tcG9uZW50RGlkQ2F0Y2giLCJlcnJvciIsImVycm9ySW5mbyIsImNvbnNvbGUiLCJyZW5kZXIiLCJzdGF0ZSIsImRpdiIsInN0eWxlIiwicGFkZGluZyIsInRleHRBbGlnbiIsImNvbG9yIiwiaDEiLCJwIiwicHJvcHMiLCJjaGlsZHJlbiIsInJvb3RFbGVtZW50IiwiZG9jdW1lbnQiLCJnZXRFbGVtZW50QnlJZCIsImxvZyIsIlN0cmljdE1vZGUiXSwibWFwcGluZ3MiOiI7Ozs7QUFBQSxPQUFPQSxTQUFTQyxTQUFTLFFBQThCLFFBQVE7QUFDL0QsU0FBU0MsVUFBVSxRQUFRLG1CQUFtQjtBQUM5QyxPQUFPQyxTQUFTLFFBQVE7QUFDeEIsT0FBTyxjQUFjO0FBRXJCLE1BQU1DLHNCQUFzQkg7SUFLMUIsT0FBT0ksMkJBQTJCO1FBQUUsT0FBTztZQUFFQyxVQUFVO1FBQUs7SUFBRztJQUMvREMsa0JBQWtCQyxLQUFZLEVBQUVDLFNBQW9CLEVBQUU7UUFDcERDLFFBQVFGLEtBQUssQ0FBQyx5Q0FBeUNBLE9BQU9DO0lBQ2hFO0lBQ0FFLFNBQVM7UUFDUCxJQUFJLElBQUksQ0FBQ0MsS0FBSyxDQUFDTixRQUFRLEVBQUU7WUFDdkIscUJBQU8sUUFBQ087Z0JBQUlDLE9BQU87b0JBQUVDLFNBQVM7b0JBQVFDLFdBQVc7b0JBQVVDLE9BQU87Z0JBQU07O2tDQUFHLFFBQUNDO2tDQUFHOzs7Ozs7a0NBQTBCLFFBQUNDO2tDQUFFOzs7Ozs7Ozs7Ozs7UUFDOUc7UUFDQSxPQUFPLElBQUksQ0FBQ0MsS0FBSyxDQUFDQyxRQUFRO0lBQzVCO0lBYkEsWUFBWUQsS0FBOEIsQ0FBRTtRQUMxQyxLQUFLLENBQUNBO1FBQ04sSUFBSSxDQUFDUixLQUFLLEdBQUc7WUFBRU4sVUFBVTtRQUFNO0lBQ2pDO0FBV0Y7QUFFQSxNQUFNZ0IsY0FBY0MsU0FBU0MsY0FBYyxDQUFDO0FBRTVDLElBQUlGLGFBQWE7SUFDZlosUUFBUWUsR0FBRyxDQUFDO0lBQ1p2QixXQUFXb0IsYUFBYVgsTUFBTSxlQUM1QixRQUFDWCxNQUFNMEIsVUFBVTtrQkFDZixjQUFBLFFBQUN0QjtzQkFDQyxjQUFBLFFBQUNEOzs7Ozs7Ozs7Ozs7Ozs7QUFJVCxPQUFPO0lBQ0xPLFFBQVFGLEtBQUssQ0FBQztBQUNoQiJ9