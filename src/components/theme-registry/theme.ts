import { createTheme } from "@mui/material/styles";

/* ================= LIGHT THEME ================= */
export const lightTheme = createTheme({
  palette: {
    mode: "light",
    background: {
      default: "#f0f2f5", // nền Facebook
      paper: "#ffffff",
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
    fontSize: 15,
    body1: {
      lineHeight: 1.34,
    },
  },

  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: "#f0f2f5",
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
export const darkTheme = createTheme({
  palette: {
    mode: "dark",
    background: {
      default: "#18191a", // nền tổng
      paper: "#242526", // card, sidebar
    },
    text: {
      primary: "#e4e6eb",
      secondary: "#b0b3b8",
    },
    divider: "#3a3b3c",
  },

  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: "#18191a",
          color: "#e4e6eb",
        },
      },
    },

    /* ================= CARD ================= */
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: "#242526",
          borderRadius: 12,
          boxShadow: "0 1px 2px rgba(0,0,0,0.4)",
        },
      },
    },

    /* ================= INPUT ================= */
    MuiInputBase: {
      styleOverrides: {
        root: {
          backgroundColor: "#3a3b3c",
          borderRadius: 20,
          padding: "6px 12px",
        },
        input: {
          color: "#e4e6eb",
        },
      },
    },

    /* ================= BUTTON ================= */
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          textTransform: "none",
          fontWeight: 600,
        },
      },
    },

    /* ================= ICON BUTTON ================= */
    MuiIconButton: {
      styleOverrides: {
        root: {
          color: "#b0b3b8",
          "&:hover": {
            backgroundColor: "#3a3b3c",
          },
        },
      },
    },

    /* ================= DIVIDER ================= */
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: "#3a3b3c",
        },
      },
    },
  },
});
