--
-- PostgreSQL database dump
--

\restrict abyy5k4pqNenEqy7UQUp4uMGa6WAMlxJHXREDDKW9sc73jqfCzadJlZxiM5OMLF

-- Dumped from database version 16.15 (Ubuntu 16.15-0ubuntu0.24.04.1)
-- Dumped by pg_dump version 16.15 (Ubuntu 16.15-0ubuntu0.24.04.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: maintenances_status_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.maintenances_status_enum AS ENUM (
    'SCHEDULED',
    'IN_PROGRESS',
    'COMPLETED',
    'CANCELLED'
);


--
-- Name: maintenances_type_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.maintenances_type_enum AS ENUM (
    'PREVENTIVE',
    'CORRECTIVE'
);


--
-- Name: mechanics_status_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.mechanics_status_enum AS ENUM (
    'ACTIVE',
    'INACTIVE'
);


--
-- Name: users_role_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.users_role_enum AS ENUM (
    'ADMIN',
    'TECHNICIAN'
);


--
-- Name: vehicles_status_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.vehicles_status_enum AS ENUM (
    'AVAILABLE',
    'IN_MAINTENANCE',
    'INACTIVE'
);


--
-- Name: workshops_status_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.workshops_status_enum AS ENUM (
    'ACTIVE',
    'INACTIVE'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: maintenances; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.maintenances (
    id integer NOT NULL,
    type public.maintenances_type_enum NOT NULL,
    description text NOT NULL,
    mileage integer NOT NULL,
    "scheduledAt" timestamp with time zone NOT NULL,
    "scheduledEndAt" timestamp with time zone NOT NULL,
    status public.maintenances_status_enum DEFAULT 'SCHEDULED'::public.maintenances_status_enum NOT NULL,
    "workDone" text,
    "finalCost" numeric(12,2),
    "finishedAt" timestamp with time zone,
    "finalMileage" integer,
    "vehicleId" integer NOT NULL,
    "mechanicId" integer NOT NULL,
    "workshopId" integer NOT NULL,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: maintenances_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.maintenances_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: maintenances_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.maintenances_id_seq OWNED BY public.maintenances.id;


--
-- Name: mechanics; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mechanics (
    id integer NOT NULL,
    name character varying(120) NOT NULL,
    email character varying(160) NOT NULL,
    specialty character varying(100) NOT NULL,
    status public.mechanics_status_enum DEFAULT 'ACTIVE'::public.mechanics_status_enum NOT NULL,
    "userId" integer,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: mechanics_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.mechanics_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: mechanics_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.mechanics_id_seq OWNED BY public.mechanics.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id integer NOT NULL,
    name character varying(120) NOT NULL,
    email character varying(160) NOT NULL,
    password character varying NOT NULL,
    role public.users_role_enum NOT NULL,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: vehicles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.vehicles (
    id integer NOT NULL,
    plate character varying(20) NOT NULL,
    brand character varying(60) NOT NULL,
    model character varying(60) NOT NULL,
    year integer NOT NULL,
    mileage integer NOT NULL,
    status public.vehicles_status_enum DEFAULT 'AVAILABLE'::public.vehicles_status_enum NOT NULL,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: vehicles_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.vehicles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: vehicles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.vehicles_id_seq OWNED BY public.vehicles.id;


--
-- Name: workshops; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.workshops (
    id integer NOT NULL,
    name character varying(120) NOT NULL,
    address character varying(200) NOT NULL,
    status public.workshops_status_enum DEFAULT 'ACTIVE'::public.workshops_status_enum NOT NULL,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: workshops_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.workshops_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: workshops_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.workshops_id_seq OWNED BY public.workshops.id;


--
-- Name: maintenances id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.maintenances ALTER COLUMN id SET DEFAULT nextval('public.maintenances_id_seq'::regclass);


--
-- Name: mechanics id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mechanics ALTER COLUMN id SET DEFAULT nextval('public.mechanics_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: vehicles id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vehicles ALTER COLUMN id SET DEFAULT nextval('public.vehicles_id_seq'::regclass);


--
-- Name: workshops id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workshops ALTER COLUMN id SET DEFAULT nextval('public.workshops_id_seq'::regclass);


--
-- Data for Name: maintenances; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.maintenances (id, type, description, mileage, "scheduledAt", "scheduledEndAt", status, "workDone", "finalCost", "finishedAt", "finalMileage", "vehicleId", "mechanicId", "workshopId", "createdAt", "updatedAt") FROM stdin;
1	CORRECTIVE	Reparación de caja de cambios	80500	2026-10-26 13:00:00+00	2026-10-26 17:00:00+00	IN_PROGRESS	\N	\N	\N	\N	3	1	1	2026-10-27 19:35:22.56288+00	2026-10-27 19:35:22.56288+00
2	PREVENTIVE	Cambio de aceite y filtros	52000	2026-10-10 12:00:00+00	2026-10-10 14:00:00+00	COMPLETED	Cambio de aceite y filtros	350000.00	2026-10-10 14:00:00+00	52300	1	2	2	2026-10-27 19:35:22.56288+00	2026-10-27 19:35:22.56288+00
\.


--
-- Data for Name: mechanics; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.mechanics (id, name, email, specialty, status, "userId", "createdAt", "updatedAt") FROM stdin;
1	Carlos Pérez	carlos.perez@fleetcore.com	Motor y transmisión	ACTIVE	2	2026-10-27 19:35:22.56288+00	2026-10-27 19:35:22.56288+00
2	Laura Gómez	laura.gomez@fleetcore.com	Frenos y suspensión	ACTIVE	3	2026-10-27 19:35:22.56288+00	2026-10-27 19:35:22.56288+00
3	Pedro Ruiz	pedro.ruiz@fleetcore.com	Electricidad automotriz	INACTIVE	\N	2026-10-27 19:35:22.56288+00	2026-10-27 19:35:22.56288+00
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, name, email, password, role, "createdAt") FROM stdin;
1	Administrador FleetCore	admin@fleetcore.com	$2b$12$maVosViDKI7QgS9EV44T4eIDOfd8VPAq2no.rhHnsGNa.g8Sm3Dbm	ADMIN	2026-10-27 19:35:22.56288+00
2	Carlos Pérez	tecnico1@fleetcore.com	$2b$12$GAQUVkbeTWPh/qGH9NJQ3uTZzzAo6Ib1bQL1DVw8pleMOKO1hd8.m	TECHNICIAN	2026-10-27 19:35:22.56288+00
3	Laura Gómez	tecnico2@fleetcore.com	$2b$12$461dMuGPGvpylzy5hv8bVuxhTUlR4u0UGmUfwYr7ZuM8S0rlJZBaC	TECHNICIAN	2026-10-27 19:35:22.56288+00
\.


--
-- Data for Name: vehicles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.vehicles (id, plate, brand, model, year, mileage, status, "createdAt", "updatedAt") FROM stdin;
1	ABC123	Chevrolet	NPR	2021	52300	AVAILABLE	2026-10-27 19:35:22.56288+00	2026-10-27 19:35:22.56288+00
2	DEF456	Hino	300	2022	18000	AVAILABLE	2026-10-27 19:35:22.56288+00	2026-10-27 19:35:22.56288+00
3	GHI789	Isuzu	FRR	2020	80500	IN_MAINTENANCE	2026-10-27 19:35:22.56288+00	2026-10-27 19:35:22.56288+00
4	JKL012	Kenworth	T800	2015	310000	INACTIVE	2026-10-27 19:35:22.56288+00	2026-10-27 19:35:22.56288+00
\.


--
-- Data for Name: workshops; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.workshops (id, name, address, status, "createdAt", "updatedAt") FROM stdin;
1	Taller Centro	Calle 45 # 12-30, Barranquilla	ACTIVE	2026-10-27 19:35:22.56288+00	2026-10-27 19:35:22.56288+00
2	Taller Norte	Carrera 51B # 80-20, Barranquilla	INACTIVE	2026-10-27 19:35:22.56288+00	2026-10-27 19:35:22.56288+00
\.


--
-- Name: maintenances_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.maintenances_id_seq', 2, true);


--
-- Name: mechanics_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.mechanics_id_seq', 3, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.users_id_seq', 3, true);


--
-- Name: vehicles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.vehicles_id_seq', 4, true);


--
-- Name: workshops_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.workshops_id_seq', 2, true);


--
-- Name: vehicles PK_18d8646b59304dce4af3a9e35b6; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vehicles
    ADD CONSTRAINT "PK_18d8646b59304dce4af3a9e35b6" PRIMARY KEY (id);


--
-- Name: mechanics PK_2c0ed23afc0cc7ff361c17e53df; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mechanics
    ADD CONSTRAINT "PK_2c0ed23afc0cc7ff361c17e53df" PRIMARY KEY (id);


--
-- Name: maintenances PK_62403473bd524a42d58589aa78b; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.maintenances
    ADD CONSTRAINT "PK_62403473bd524a42d58589aa78b" PRIMARY KEY (id);


--
-- Name: workshops PK_6d0e82a124f5b53df91c8989848; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workshops
    ADD CONSTRAINT "PK_6d0e82a124f5b53df91c8989848" PRIMARY KEY (id);


--
-- Name: users PK_a3ffb1c0c8416b9fc6f907b7433; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY (id);


--
-- Name: mechanics UQ_301c3b5fa2d49aab65dcfda36a6; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mechanics
    ADD CONSTRAINT "UQ_301c3b5fa2d49aab65dcfda36a6" UNIQUE (email);


--
-- Name: workshops UQ_84a8c763773a6482ba066f608c3; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workshops
    ADD CONSTRAINT "UQ_84a8c763773a6482ba066f608c3" UNIQUE (name);


--
-- Name: mechanics UQ_85c0da75e5dedc5eca00055cfbe; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mechanics
    ADD CONSTRAINT "UQ_85c0da75e5dedc5eca00055cfbe" UNIQUE ("userId");


--
-- Name: users UQ_97672ac88f789774dd47f7c8be3; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE (email);


--
-- Name: vehicles UQ_ec7181ebdab798d97070122a5bf; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vehicles
    ADD CONSTRAINT "UQ_ec7181ebdab798d97070122a5bf" UNIQUE (plate);


--
-- Name: IDX_30e3045af37d4cffd01e4c83d5; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_30e3045af37d4cffd01e4c83d5" ON public.maintenances USING btree ("mechanicId", status);


--
-- Name: IDX_8447c993db1e7f1833847445c0; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_8447c993db1e7f1833847445c0" ON public.maintenances USING btree ("vehicleId", status);


--
-- Name: maintenances FK_3a9ba7c05e1ffba00560d11f364; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.maintenances
    ADD CONSTRAINT "FK_3a9ba7c05e1ffba00560d11f364" FOREIGN KEY ("mechanicId") REFERENCES public.mechanics(id);


--
-- Name: maintenances FK_75331cd2a0f0c22bcb2fc4f6d6a; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.maintenances
    ADD CONSTRAINT "FK_75331cd2a0f0c22bcb2fc4f6d6a" FOREIGN KEY ("workshopId") REFERENCES public.workshops(id);


--
-- Name: mechanics FK_85c0da75e5dedc5eca00055cfbe; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mechanics
    ADD CONSTRAINT "FK_85c0da75e5dedc5eca00055cfbe" FOREIGN KEY ("userId") REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: maintenances FK_daa193fdfccde41a2ed4de8a474; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.maintenances
    ADD CONSTRAINT "FK_daa193fdfccde41a2ed4de8a474" FOREIGN KEY ("vehicleId") REFERENCES public.vehicles(id);


--
-- Name: audit_logs_action_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.audit_logs_action_enum AS ENUM (
    'CREATE',
    'UPDATE',
    'STATUS_CHANGE',
    'INACTIVATE'
);


--
-- Name: audit_logs_userrole_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.audit_logs_userrole_enum AS ENUM (
    'ADMIN',
    'TECHNICIAN'
);


--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.audit_logs (
    id integer NOT NULL,
    action public.audit_logs_action_enum NOT NULL,
    entity character varying(40) NOT NULL,
    "entityId" integer,
    "userId" integer,
    "userEmail" character varying(160),
    "userRole" public.audit_logs_userrole_enum,
    method character varying(10) NOT NULL,
    path character varying(200) NOT NULL,
    details jsonb,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: audit_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.audit_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.audit_logs_id_seq OWNED BY public.audit_logs.id;

ALTER TABLE ONLY public.audit_logs ALTER COLUMN id SET DEFAULT nextval('public.audit_logs_id_seq'::regclass);

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT "PK_1bb179d048bbc581caa3b013439" PRIMARY KEY (id);

CREATE INDEX "IDX_2643f2a68c662985433dbddca1" ON public.audit_logs USING btree (entity, "entityId");

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT "FK_cfa83f61e4d27a87fcae1e025ab" FOREIGN KEY ("userId") REFERENCES public.users(id) ON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--

\unrestrict abyy5k4pqNenEqy7UQUp4uMGa6WAMlxJHXREDDKW9sc73jqfCzadJlZxiM5OMLF

