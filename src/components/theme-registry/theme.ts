import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "light",
    background: {
      default: "#f0f2f5", // 👈 nền Facebook
    },
  },

  typography: {
    fontFamily: [
      "Segoe UI",
      "Helvetica Neue",
      "Helvetica",
      "Arial",
      "sans-serif",
    ].join(","),

    fontSize: 15, // 👈 Facebook ~15px
    body1: {
      lineHeight: 1.34, // 👈 Facebook chuẩn
    },
  },

  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          fontFamily: '"Segoe UI","Helvetica Neue",Helvetica,Arial,sans-serif',
        },
      },
    },

    MuiAlert: {
      styleOverrides: {
        root: ({ ownerState }) => ({
          ...(ownerState.severity === "info" && {
            backgroundColor: "#60a5fa",
          }),
        }),
      },
    },
  },
});

export default theme;
