import {
  Box,
  Divider,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";
import {
  DashboardOutlined,
  EventNoteOutlined,
  GroupOutlined,
   
  SettingsOutlined,
} from "@mui/icons-material";
import PianoOutlined from '@mui/icons-material/PianoOutlined';
import LibraryMusicIcon from '@mui/icons-material/LibraryMusic';
 
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

export const DRAWER_WIDTH = 260;

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const menuItems = [
    {
      label: "Dashboard",
      path: "/dashboard",
      icon: <DashboardOutlined />,
      profiles: ["ADMIN", "LIDER", "MUSICO"],
    },

    {
      label: "Departamentos",
      path: "/departamentos",
      icon: <GroupOutlined />,
      profiles: ["ADMIN"],
    },
    {
      label: "Instrumentos",
      path: "/instrumentos",
      icon: <PianoOutlined  />,
      profiles: ["ADMIN"],
    },

    {
      label: "Perfil",
      path: "/usuarios",
      icon: <GroupOutlined />,
      profiles: ["ADMIN", "LIDER"],
    },
        {
      label: "Agenda",
      path: "/agenda-mensal",
      icon: <CalendarMonthOutlinedIcon />,
      profiles: ["ADMIN", "LIDER"],
    },

    {
      label: "Escalas",
      path: "/escalas",
      icon: <EventNoteOutlined />,
      profiles: ["ADMIN", "LIDER"],
    },
      {
      label: "Musicas",
      path: "/musicas",
      icon: <LibraryMusicIcon />,
      profiles: ["ADMIN", "LIDER","MUSICO"],
    },  
    {
      label: "Repertório",
      path: "/playlist",
      icon: <LibraryMusicIcon />,
      profiles: ["ADMIN", "LIDER"],
    },

    {
      label: "Minhas Escalas",
      path: "/minhas-escalas",
      icon: <EventNoteOutlined />,
      profiles: ["ADMIN", "LIDER", "MUSICO"],
    },
    
    {
      label: "Configurações",
      path: "/configuracoes",
      icon: <SettingsOutlined />,
      profiles: ["ADMIN"],
    },
  ];

  const visibleItems = menuItems.filter((item) =>
    item.profiles.includes(user?.perfil),
  );

  return (
    <Box
      component="aside"
      sx={{
        width: DRAWER_WIDTH,
        minHeight: "100vh",
        position: "fixed",
        top: 0,
        left: 0,
        display: { xs: "none", md: "flex" },
        flexDirection: "column",
        borderRight: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        zIndex: 1200,
      }}
    >
      <Box sx={{ px: 3, py: 3 }}>
        <Typography
          variant="h6"
          sx={{
            color: "primary.main",
            fontWeight: 800,
            letterSpacing: "-0.5px",
          }}
        >
          ESCALA PRO
        </Typography>

        <Typography variant="caption" color="text.secondary">
          Gestão de escalas
        </Typography>
      </Box>

      <Divider />

      <List sx={{ px: 1.5, py: 2, flexGrow: 1 }}>
        {visibleItems.map((item) => {
          const active =
            location.pathname === item.path ||
            location.pathname.startsWith(`${item.path}/`);

          return (
            <ListItemButton
              key={item.path}
              onClick={() => navigate(item.path)}
              selected={active}
              sx={{
                mb: 0.5,
                minHeight: 46,
                borderRadius: 2,
                color: active ? "primary.main" : "text.secondary",

                "& .MuiListItemIcon-root": {
                  minWidth: 40,
                  color: active ? "primary.main" : "text.secondary",
                },

                "&.Mui-selected": {
                  bgcolor: "primary.main",
                  color: "#FFFFFF",

                  "& .MuiListItemIcon-root": {
                    color: "#FFFFFF",
                  },

                  "&:hover": {
                    bgcolor: "primary.dark",
                  },
                },
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{
                  fontSize: 14,
                  fontWeight: active ? 700 : 500,
                }}
              />
            </ListItemButton>
          );
        })}
      </List>

      <Box sx={{ p: 2 }}>
        <Box
          sx={{
            p: 2,
            borderRadius: 2,
            bgcolor: "action.hover",
          }}
        >
          <Typography variant="caption" color="text.secondary">
            Perfil atual
          </Typography>

          <Typography variant="body2" fontWeight={700} sx={{ mt: 0.5 }}>
            {user?.perfil || "Não identificado"}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
