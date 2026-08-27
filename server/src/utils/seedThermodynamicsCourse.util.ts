import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import Course, { ICourse } from '../models/course.model';
import Chapter from '../models/chapter.model';
import Topic, { ITopicContent } from '../models/topic.model';
import Flashcard from '../models/flashcard.model';
import MCQ from '../models/mcq.model';
import { connectDB } from '../config/db.config';

interface TopicSeed {
  title: string;
  description: string;
  contents: ITopicContent[];
  flashcards: { question: string; answer: string }[];
  mcqs: { question: string; options: { text: string; isCorrect: boolean }[]; explanation: string }[];
}

export const thermodynamicsCourseSeed: { course: Partial<ICourse>; topics: TopicSeed[] } = {
  course: {
    title: 'Fundamentals of Thermodynamics',
    description: 'Master the laws of energy, heat transfer, work, entropy, power cycles, and property relations in physical systems.',
    longDescription:
      'A comprehensive, university-level course covering classical and applied thermodynamics. Learn the foundational concepts of system boundaries, state variables, the Zeroth, First, Second, and Third Laws of Thermodynamics, control volume energy analysis, Carnot efficiency, entropy generation, steam property tables, and thermodynamic cycles like Rankine, Otto, and Refrigeration.',
    category: 'Physics',
    difficulty: 'intermediate',
    whatYouWillLearn: [
      'Define thermodynamic systems, boundaries, state properties, and thermodynamic equilibrium',
      'Apply the Zeroth Law and calculate temperature scales (Celsius, Kelvin, Fahrenheit, Rankine)',
      'Calculate boundary work, heat transfer, and energy balances for closed systems',
      'Apply the First Law of Thermodynamics to open control volumes (turbines, compressors, nozzles, heat exchangers)',
      'Evaluate Heat Engines, Refrigerators, Heat Pumps, and Thermal Efficiency under the Second Law',
      'Analyze the Carnot Cycle, Entropy generation (S_gen), and Isentropic processes',
      'Understand phase change behavior of pure substances using P-v and T-v property diagrams and steam tables',
      'Evaluate gas and vapor power cycles (Otto, Diesel, Rankine) and refrigeration cycles',
    ],
    isPublished: true,
    order: 4,
    isFree: true,
    price: 0,
  },
  topics: [
    {
      title: 'Module 1: Fundamental Concepts & The Zeroth Law',
      description: 'Understand thermodynamic systems, boundaries, states, intensive/extensive properties, and thermal equilibrium.',
      contents: [
        {
          type: 'text',
          title: 'What is Thermodynamics?',
          content:
            'Thermodynamics comes from the Greek words *therme* (heat) and *dynamis* (power). It is the branch of physics and engineering that studies energy, energy transformations, heat, work, and the physical properties of matter.\n\n**Core Definitions:**\n- **System**: A specified region of matter or space chosen for study.\n- **Surroundings**: Everything external to the system boundary.\n- **Boundary**: The real or imaginary surface separating system and surroundings.',
        },
        {
          type: 'text',
          title: 'Classifications of Thermodynamic Systems',
          content:
            '1. **Closed System (Control Mass)**: Contains a fixed amount of mass. Mass cannot cross the boundary, but energy (heat and work) CAN cross the boundary.\n2. **Open System (Control Volume)**: Both mass and energy can cross the boundary (e.g., water flowing through a pipe, turbine, or nozzle).\n3. **Isolated System**: Neither mass nor energy can cross the system boundary.',
        },
        {
          type: 'latex',
          title: 'Properties & State Variables',
          content:
            'Properties characterize the physical state of a system:\n\n- **Intensive Properties**: Independent of the mass/size of the system (e.g., Temperature \\(T\\), Pressure \\(P\\), Density \\(\\rho\\)).\n- **Extensive Properties**: Depend on the size or mass of the system (e.g., Total Mass \\(m\\), Total Volume \\(V\\), Total Internal Energy \\(U\\)).\n- **Specific Properties**: Extensive properties expressed per unit mass (e.g., Specific Volume \\(v = V/m\\), Specific Internal Energy \\(u = U/m\\)).',
        },
        {
          type: 'text',
          title: 'The Zeroth Law of Thermodynamics & Temperature Scales',
          content:
            '**The Zeroth Law of Thermodynamics** states:\n> *If two bodies (A and B) are each in thermal equilibrium with a third body (C), then bodies A and B are also in thermal equilibrium with each other.*\n\nThis law serves as the physical foundation for temperature measurement. If Body C is a thermometer, bodies A and B have the exact same temperature.',
        },
        {
          type: 'code',
          title: 'Temperature Scale Conversions',
          content:
            '# Absolute Temperature Conversions (SI & Imperial)\n' +
            '# Kelvin (K) = Celsius (°C) + 273.15\n' +
            '# Rankine (R) = Fahrenheit (°F) + 459.67\n' +
            '# Rankine (R) = 1.8 * Kelvin (K)\n\n' +
            'def celsius_to_kelvin(celsius):\n' +
            '    return celsius + 273.15\n\n' +
            'def fahrenheit_to_rankine(fahrenheit):\n' +
            '    return fahrenheit + 459.67\n\n' +
            'print(f"25°C in Kelvin = {celsius_to_kelvin(25)} K")\n' +
            'print(f"77°F in Rankine = {fahrenheit_to_rankine(77)} R")',
          language: 'python',
        },
        {
          type: 'quiz',
          title: 'Quick Check: System Classification',
          content: 'Quiz',
          quiz: {
            question: 'What type of thermodynamic system allows energy to cross its boundary, but prevents mass from entering or escaping?',
            options: [
              { text: 'Closed System (Control Mass)', isCorrect: true },
              { text: 'Open System (Control Volume)', isCorrect: false },
              { text: 'Isolated System', isCorrect: false },
              { text: 'Adiabatic System', isCorrect: false },
            ],
            explanation: 'A closed system has a fixed mass; energy in the form of heat and work can cross the boundary, but mass cannot.',
          },
        },
      ],
      flashcards: [
        { question: 'What is an intensive property?', answer: 'A thermodynamic property independent of system mass or volume (e.g., temperature, pressure, density).' },
        { question: 'What is the Zeroth Law of Thermodynamics?', answer: 'If bodies A and B are in thermal equilibrium with C, then A and B are in thermal equilibrium with each other.' },
        { question: 'What formula converts Celsius to absolute Kelvin?', answer: 'K = °C + 273.15' },
        { question: 'What defines an isolated system?', answer: 'A system where neither mass nor energy can cross the system boundary.' },
      ],
      mcqs: [
        {
          question: 'Which of the following is an EXTENSIVE property of a system?',
          options: [
            { text: 'Total Volume (V)', isCorrect: true },
            { text: 'Temperature (T)', isCorrect: false },
            { text: 'Pressure (P)', isCorrect: false },
            { text: 'Density (ρ)', isCorrect: false },
          ],
          explanation: 'Total volume depends on the total mass/size of the system, making it an extensive property.',
        },
        {
          question: 'What is the absolute zero temperature in Celsius?',
          options: [
            { text: '-273.15 °C', isCorrect: true },
            { text: '0 °C', isCorrect: false },
            { text: '-100 °C', isCorrect: false },
            { text: '-459.67 °C', isCorrect: false },
          ],
          explanation: '0 Kelvin corresponds to -273.15 °C.',
        },
      ],
    },
    {
      title: 'Module 2: Work, Heat, and Energy Transfer',
      description: 'Analyze heat transfer, boundary work in moving piston-cylinder systems, specific heat capacities, and polytropic expansion.',
      contents: [
        {
          type: 'text',
          title: 'Forms of Energy: Work vs Heat',
          content:
            'Energy can cross the boundary of a closed system in two distinct forms: **Heat** and **Work**.\n\n- **Heat (Q)**: Energy transfer driven solely by a temperature difference between system and surroundings.\n- **Work (W)**: Energy transfer associated with a force acting through a distance (mechanical, electrical, shaft work).\n\n**Sign Convention:**\n- Heat transfer INTO system: \\(Q > 0\\) (Positive)\n- Heat transfer OUT OF system: \\(Q < 0\\) (Negative)\n- Work done BY system on surroundings: \\(W > 0\\) (Positive)\n- Work done ON system by surroundings: \\(W < 0\\) (Negative)',
        },
        {
          type: 'latex',
          title: 'Boundary Work (P-dV Work)',
          content:
            'In a expansion/compression process of a gas in a piston-cylinder device, moving boundary work \\(W_b\\) is defined as:\n\n\\[ W_b = \\int_{1}^{2} P \\, dV \\]\n\nOn a **Pressure-Volume (P-V) Diagram**, boundary work is equal to the area under the process curve from state 1 to state 2.',
        },
        {
          type: 'latex',
          title: 'Special Process Boundary Work Formulas',
          content:
            '1. **Isobaric Process (Constant Pressure, \\(P_1 = P_2 = P\\)):**\n\\[ W_b = P (V_2 - V_1) \\]\n\n2. **Isochoric Process (Constant Volume, \\(dV = 0\\)):**\n\\[ W_b = 0 \\]\n\n3. **Isothermal Process (Constant Temperature for Ideal Gas, \\(PV = C\\)):**\n\\[ W_b = P_1 V_1 \\ln\\left(\\frac{V_2}{V_1}\\right) = m R T \\ln\\left(\\frac{V_2}{V_1}\\right) \\]\n\n4. **Polytropic Process (\\(P V^n = C\\), \\(n \\neq 1\\)):**\n\\[ W_b = \\frac{P_2 V_2 - P_1 V_1}{1 - n} = \\frac{m R (T_2 - T_1)}{1 - n} \\]',
        },
        {
          type: 'code',
          title: 'Calculating Polytropic Boundary Work in Python',
          content:
            '# Calculate boundary work during polytropic expansion\n' +
            '# P1 = 300 kPa, V1 = 0.1 m^3, V2 = 0.3 m^3, n = 1.3\n\n' +
            'def polytropic_work(P1, V1, V2, n):\n' +
            '    # P1*V1^n = P2*V2^n  =>  P2 = P1 * (V1/V2)^n\n' +
            '    P2 = P1 * ((V1 / V2) ** n)\n' +
            '    W = (P2 * V2 - P1 * V1) / (1 - n)\n' +
            '    return W, P2\n\n' +
            'W_kJ, P2_kPa = polytropic_work(300, 0.1, 0.3, 1.3)\n' +
            'print(f"Final Pressure P2: {P2_kPa:.2f} kPa")\n' +
            'print(f"Boundary Work W_b: {W_kJ:.2f} kJ")',
          language: 'python',
        },
        {
          type: 'quiz',
          title: 'Quick Check: Isochoric Boundary Work',
          content: 'Quiz',
          quiz: {
            question: 'How much boundary work is done during a constant-volume (isochoric) process?',
            options: [
              { text: 'Zero (W = 0)', isCorrect: true },
              { text: 'W = P * V', isCorrect: false },
              { text: 'W = m * Cp * ΔT', isCorrect: false },
              { text: 'W = P * ln(V2/V1)', isCorrect: false },
            ],
            explanation: 'Boundary work is defined as ∫ P dV. Since volume does not change (dV = 0), work is zero.',
          },
        },
      ],
      flashcards: [
        { question: 'What is boundary work formula for moving piston?', answer: 'W_b = ∫ P dV (area under process curve on P-V diagram).' },
        { question: 'What is the sign of work done BY the system on surroundings?', answer: 'Positive (W > 0).' },
        { question: 'What is specific heat capacity at constant volume (Cv)?', answer: 'Energy required to raise temperature of 1 kg mass by 1 °C at constant volume.' },
      ],
      mcqs: [
        {
          question: 'What is the boundary work formula for an isothermal expansion of an ideal gas?',
          options: [
            { text: 'W = P1 * V1 * ln(V2 / V1)', isCorrect: true },
            { text: 'W = P * (V2 - V1)', isCorrect: false },
            { text: 'W = 0', isCorrect: false },
            { text: 'W = (P2*V2 - P1*V1)/(1-n)', isCorrect: false },
          ],
          explanation: 'For an ideal gas at constant temperature, P = C/V, yielding W = P1*V1*ln(V2/V1).',
        },
      ],
    },
    {
      title: 'Module 3: The First Law of Thermodynamics (Energy Conservation)',
      description: 'Apply the First Law of Thermodynamics to closed systems and steady-flow open control volumes.',
      contents: [
        {
          type: 'text',
          title: 'The First Law for Closed Systems',
          content:
            'The **First Law of Thermodynamics** is the conservation of energy principle:\n> *Energy can neither be created nor destroyed; it can only change form.*\n\nFor a closed system undergoing a change of state:\n\n\\( \\Delta E_{system} = Q_{net, in} - W_{net, out} \\)\n\nWhere total system energy \\(E = U + KE + PE\\):\n\n\\( \\Delta U + \\Delta KE + \\Delta PE = Q - W \\)\n\nFor stationary closed systems (negligible kinetic and potential energy changes):\n\n\\( \\Delta U = Q - W \\)',
        },
        {
          type: 'latex',
          title: 'Enthalpy Definition & Specific Heats',
          content:
            'In flow processes and constant-pressure heating, internal energy \\(U\\) and flow work \\(PV\\) frequently combine into **Enthalpy (H)**:\n\n\\[ H = U + P V \\quad \\text{or} \\quad h = u + P v \\]\n\nFor ideal gases:\n\\[ du = C_v \\, dT \\quad \\implies \\quad \\Delta u = C_v (T_2 - T_1) \\]\n\\[ dh = C_p \\, dT \\quad \\implies \\quad \\Delta h = C_p (T_2 - T_1) \\]\n\\[ C_p - C_v = R \\quad \\text{and} \\quad k = \\frac{C_p}{C_v} \\]',
        },
        {
          type: 'latex',
          title: 'First Law for Open Systems (Control Volume Energy Balance)',
          content:
            'For a **Steady-Flow Engineering System** (mass flow rate in = mass flow rate out, \\(\\dot{m}_{in} = \\dot{m}_{out} = \\dot{m}\\)):\n\n\\[ \\dot{Q} - \\dot{W} = \\dot{m} \\left[ \\left(h_2 - h_1\\right) + \\frac{V_2^2 - V_1^2}{2} + g (z_2 - z_1) \\right] \\]\n\n**Common Engineering Control Volume Simplifications:**\n- **Nozzles & Diffusers**: High velocity changes, \\(\\dot{W} = 0, \\dot{Q} \\approx 0\\).\n- **Turbines**: Produces work output, \\(\\dot{W}_{out} = \\dot{m}(h_1 - h_2)\\).\n- **Compressors & Pumps**: Work input required, \\(\\dot{W}_{in} = \\dot{m}(h_2 - h_1)\\).\n- **Throttling Valves**: Insulated restriction, constant enthalpy process (\\(h_1 = h_2\\)).',
        },
        {
          type: 'code',
          title: 'Steam Turbine Power Output Calculation',
          content:
            '# Calculate power produced by steam turbine\n' +
            '# Mass flow rate m_dot = 5 kg/s\n' +
            '# Inlet enthalpy h1 = 3200 kJ/kg, Outlet enthalpy h2 = 2400 kJ/kg\n' +
            '# Heat loss Q_dot = -50 kW\n\n' +
            'm_dot = 5.0  # kg/s\n' +
            'h1 = 3200.0  # kJ/kg\n' +
            'h2 = 2400.0  # kJ/kg\n' +
            'Q_dot = -50.0 # kW (heat lost to surroundings)\n\n' +
            '# Q_dot - W_dot = m_dot * (h2 - h1)\n' +
            'W_dot = Q_dot - m_dot * (h2 - h1)\n' +
            'print(f"Turbine Power Output W_dot: {W_dot:.2f} kW ({W_dot/1000:.2f} MW)")',
          language: 'python',
        },
        {
          type: 'quiz',
          title: 'Quick Check: Throttling Valve Enthalpy',
          content: 'Quiz',
          quiz: {
            question: 'What property remains constant across an ideal adiabatic throttling valve?',
            options: [
              { text: 'Enthalpy (h1 = h2)', isCorrect: true },
              { text: 'Temperature (T1 = T2)', isCorrect: false },
              { text: 'Pressure (P1 = P2)', isCorrect: false },
              { text: 'Entropy (s1 = s2)', isCorrect: false },
            ],
            explanation: 'In a throttling device (like an expansion valve), flow work converts to internal energy, keeping specific enthalpy constant.',
          },
        },
      ],
      flashcards: [
        { question: 'What is the First Law equation for stationary closed system?', answer: 'ΔU = Q - W' },
        { question: 'What is the mathematical definition of enthalpy (H)?', answer: 'H = U + PV' },
        { question: 'What is the relation between Cp, Cv, and gas constant R for ideal gas?', answer: 'Cp - Cv = R' },
        { question: 'What energy term dominates in steam turbines to generate work?', answer: 'Enthalpy drop across turbine blades: W_dot = m_dot * (h1 - h2).' },
      ],
      mcqs: [
        {
          question: 'In a steady-flow adiabatic steam turbine with negligible kinetic/potential energy changes, what is work output equal to?',
          options: [
            { text: 'W_dot = m_dot * (h1 - h2)', isCorrect: true },
            { text: 'W_dot = m_dot * (u1 - u2)', isCorrect: false },
            { text: 'W_dot = Q_dot', isCorrect: false },
            { text: 'W_dot = 0', isCorrect: false },
          ],
          explanation: 'For adiabatic turbine (Q_dot=0), energy balance reduces to W_dot = m_dot * (h1 - h2).',
        },
      ],
    },
    {
      title: 'Module 4: The Second Law of Thermodynamics & Heat Engines',
      description: 'Understand thermal energy reservoirs, heat engines, efficiency limits, Clausius/Kelvin-Planck statements, and COP.',
      contents: [
        {
          type: 'text',
          title: 'Need for the Second Law',
          content:
            'The First Law asserts that energy must be conserved, but it does NOT restrict the direction of energy flow. For example:\n- Heat spontaneously flows from a hot coffee cup to room-temperature air, but room air never spontaneously concentrates heat to boil cold coffee.\n\n**The Second Law of Thermodynamics** dictates the direction of spontaneous processes and establishes quality/degradation limits of energy.',
        },
        {
          type: 'latex',
          title: 'Heat Engines & Thermal Efficiency',
          content:
            'A **Heat Engine** is a device that converts heat into mechanical work operating in a thermodynamic cycle.\n\n- Absorbs heat \\(Q_H\\) from high-temperature reservoir at \\(T_H\\).\n- Rejects waste heat \\(Q_L\\) to low-temperature sink at \\(T_L\\).\n- Produces net work output \\(W_{net, out} = Q_H - Q_L\\).\n\n**Thermal Efficiency (\\(\\eta_{th}\\)):**\n\\[ \\eta_{th} = \\frac{W_{net, out}}{Q_H} = \\frac{Q_H - Q_L}{Q_H} = 1 - \\frac{Q_L}{Q_H} \\]',
        },
        {
          type: 'text',
          title: 'Classical Statements of the Second Law',
          content:
            '1. **Kelvin-Planck Statement**:\n> *It is impossible for any device operating in a cycle to receive heat from a single thermal reservoir and produce a net amount of work.*\n(No heat engine can achieve 100% thermal efficiency; waste heat \\(Q_L > 0\\) is mandatory).\n\n2. **Clausius Statement**:\n> *It is impossible to construct a device operating in a cycle that produces no effect other than the transfer of heat from a lower-temperature body to a higher-temperature body.*\n(Refrigerators require work input \\(W_{in}\\) to pump heat uphill).',
        },
        {
          type: 'latex',
          title: 'Refrigerators & Heat Pumps (Coefficient of Performance)',
          content:
            'Refrigerators and Heat Pumps transfer heat from low temperature \\(T_L\\) to high temperature \\(T_H\\) using work input \\(W_{in}\\).\n\n- **Refrigerator COP (\\(COP_R\\)):** Desired output is cooling \\(Q_L\\):\n\\[ COP_R = \\frac{Q_L}{W_{in}} = \\frac{Q_L}{Q_H - Q_L} \\]\n\n- **Heat Pump COP (\\(COP_{HP}\\)):** Desired output is heating \\(Q_H\\):\n\\[ COP_{HP} = \\frac{Q_H}{W_{in}} = \\frac{Q_H}{Q_H - Q_L} = COP_R + 1 \\]',
        },
        {
          type: 'quiz',
          title: 'Quick Check: Kelvin-Planck Statement',
          content: 'Quiz',
          quiz: {
            question: 'Can a heat engine convert 100% of input heat directly into net work without rejecting waste heat?',
            options: [
              { text: 'No, this violates the Kelvin-Planck statement of the Second Law', isCorrect: true },
              { text: 'Yes, if frictionless pistons are used', isCorrect: false },
              { text: 'Yes, if operating on ideal gas', isCorrect: false },
              { text: 'Yes, in cold weather', isCorrect: false },
            ],
            explanation: 'The Kelvin-Planck statement asserts no heat engine can have 100% thermal efficiency.',
          },
        },
      ],
      flashcards: [
        { question: 'What is thermal efficiency formula for a heat engine?', answer: 'η_th = W_net / Q_H = 1 - (Q_L / Q_H)' },
        { question: 'What is Kelvin-Planck statement?', answer: 'No cyclic heat engine can produce net work while exchanging heat with only a single reservoir.' },
        { question: 'What is the relationship between COP_HP and COP_R?', answer: 'COP_HP = COP_R + 1' },
      ],
      mcqs: [
        {
          question: 'A heat engine absorbs 1000 kJ of heat from a furnace and rejects 600 kJ of heat to the atmosphere. What is its thermal efficiency?',
          options: [
            { text: '40%', isCorrect: true },
            { text: '60%', isCorrect: false },
            { text: '100%', isCorrect: false },
            { text: '66.7%', isCorrect: false },
          ],
          explanation: 'W_net = 1000 - 600 = 400 kJ. Thermal efficiency = 400 / 1000 = 0.40 (40%).',
        },
      ],
    },
    {
      title: 'Module 5: The Carnot Cycle & Entropy',
      description: 'Master reversible processes, Carnot principles, maximum efficiency limit, entropy definition, and entropy generation.',
      contents: [
        {
          type: 'text',
          title: 'The Carnot Cycle & Reversibility',
          content:
            'In 1824, Nicolas Léonard Sadi Carnot proposed a theoretical ideal cycle operating between two thermal reservoirs. The **Carnot Cycle** consists of four internally reversible processes:\n\n1. **Reversible Isothermal Expansion** at high temperature \\(T_H\\).\n2. **Reversible Isentropic (Adiabatic) Expansion** from \\(T_H\\) to \\(T_L\\).\n3. **Reversible Isothermal Compression** at low temperature \\(T_L\\).\n4. **Reversible Isentropic (Adiabatic) Compression** from \\(T_L\\) to \\(T_H\\).',
        },
        {
          type: 'latex',
          title: 'Carnot Efficiency & Thermodynamic Temperature Scale',
          content:
            'For reversible cycles, heat transfer ratio equals absolute temperature ratio:\n\n\\[ \\left(\\frac{Q_L}{Q_H}\\right)_{rev} = \\frac{T_L}{T_H} \\quad \\text{(Temperatures MUST be in Kelvin or Rankine)}\\n\n\\[ \\eta_{th, Carnot} = 1 - \\frac{T_L}{T_H} \\]\n\nNo engine operating between reservoirs at \\(T_H\\) and \\(T_L\\) can have a higher efficiency than a Carnot engine operating between the same limits.',
        },
        {
          type: 'latex',
          title: 'Clausius Inequality & Definition of Entropy',
          content:
            'The **Clausius Inequality** states for any cycle:\n\\[ \\oint \\frac{\\delta Q}{T} \\le 0 \\]\n\nFor a internally reversible process, this integral depends only on states, defining a state property called **Entropy (S)**:\n\\[ dS = \\left(\\frac{\\delta Q}{T}\\right)_{rev} \\quad \\implies \\quad \\Delta S = S_2 - S_1 = \\int_{1}^{2} \\left(\\frac{\\delta Q}{T}\\right)_{rev} \\]',
        },
        {
          type: 'latex',
          title: 'Increase of Entropy Principle & Entropy Generation',
          content:
            'For any actual process in an isolated system or universe:\n\\[ S_{gen} \\ge 0 \\]\n\n- \\(S_{gen} > 0\\): Irreversible (real-world) process\n- \\(S_{gen} = 0\\): Reversible (ideal) process\n- \\(S_{gen} < 0\\): Impossible process\n\n**Isentropic Process**: A process that is both **adiabatic** (\\(Q=0\\)) and **internally reversible** (\\(S_{gen}=0\\)) has constant entropy (\\(s_1 = s_2\\)).',
        },
        {
          type: 'code',
          title: 'Calculating Maximum Carnot Efficiency in Python',
          content:
            '# Calculate Carnot Efficiency for power plant\n' +
            '# Boiler Temperature TH = 500 °C = 773.15 K\n' +
            '# Cooling Tower Temperature TL = 30 °C = 303.15 K\n\n' +
            'TH_celsius = 500.0\n' +
            'TL_celsius = 30.0\n\n' +
            'TH_K = TH_celsius + 273.15\n' +
            'TL_K = TL_celsius + 273.15\n\n' +
            'eta_carnot = 1.0 - (TL_K / TH_K)\n' +
            'print(f"TH: {TH_K:.2f} K, TL: {TL_K:.2f} K")\n' +
            'print(f"Maximum Carnot Efficiency: {eta_carnot * 100:.2f}%")',
          language: 'python',
        },
        {
          type: 'quiz',
          title: 'Quick Check: Carnot Efficiency Limit',
          content: 'Quiz',
          quiz: {
            question: 'An inventor claims to have built an engine operating between 600 K and 300 K that achieves 60% thermal efficiency. Is this claim physically possible?',
            options: [
              { text: 'No, because the maximum Carnot efficiency limit is 50%', isCorrect: true },
              { text: 'Yes, if friction is low', isCorrect: false },
              { text: 'Yes, if using hydrogen fuel', isCorrect: false },
              { text: 'Yes, exact match', isCorrect: false },
            ],
            explanation: 'Carnot limit = 1 - (300/600) = 0.50 (50%). An efficiency of 60% violates the Second Law.',
          },
        },
      ],
      flashcards: [
        { question: 'What is the Carnot thermal efficiency formula?', answer: 'η_Carnot = 1 - (TL / TH) using absolute temperatures in Kelvin/Rankine.' },
        { question: 'What is the definition of entropy change (dS) for reversible process?', answer: 'dS = (δQ / T)_rev' },
        { question: 'What conditions make a process isentropic (constant entropy)?', answer: 'The process must be both adiabatic (Q = 0) and internally reversible (S_gen = 0).' },
      ],
      mcqs: [
        {
          question: 'According to the Increase of Entropy Principle, what must be true for entropy generation (S_gen) during any real, actual physical process?',
          options: [
            { text: 'S_gen > 0 (strictly positive)', isCorrect: true },
            { text: 'S_gen = 0', isCorrect: false },
            { text: 'S_gen < 0', isCorrect: false },
            { text: 'S_gen varies linearly with volume', isCorrect: false },
          ],
          explanation: 'Real-world actual processes are irreversible due to friction, mixing, or heat transfer across finite temperature differences, generating positive entropy (S_gen > 0).',
        },
      ],
    },
    {
      title: 'Module 6: Pure Substances & Phase Change Thermodynamics',
      description: 'Analyze phase change processes of water/steam using saturated liquid-vapor regions, quality (x), and property tables.',
      contents: [
        {
          type: 'text',
          title: 'Phases of Pure Substances',
          content:
            'A **Pure Substance** has a fixed chemical composition throughout (e.g., water, nitrogen, helium, R-134a refrigerant).\n\n**Phase States of Water at Constant Pressure (1 atm):**\n1. **Compressed/Subcooled Liquid**: Water at temperatures below boiling (e.g., 20 °C at 1 atm).\n2. **Saturated Liquid**: Water at the verge of vaporizing (100 °C at 1 atm).\n3. **Saturated Liquid-Vapor Mixture**: Coexisting liquid and vapor phase at saturation temperature.\n4. **Saturated Vapor**: Steam at the verge of condensing (100 °C at 1 atm).\n5. **Superheated Vapor**: Steam at temperatures above saturation temperature (e.g., 150 °C at 1 atm).',
        },
        {
          type: 'latex',
          title: 'Vapor Quality (x) & Mixture Properties',
          content:
            'In the saturated mixture region, **Vapor Quality (x)** is defined as the ratio of vapor mass to total mixture mass:\n\n\\[ x = \\frac{m_{vapor}}{m_{total}} = \\frac{m_g}{m_f + m_g} \\quad (0 \\le x \\le 1) \\]\n\n- \\(x = 0\\): 100% Saturated Liquid (State \\(f\\))\n- \\(x = 1\\): 100% Saturated Vapor (State \\(g\\))\n\n**Average Property Equation in Mixture Region:**\n\\[ v = v_f + x \\cdot v_{fg} = v_f + x (v_g - v_f) \\]\n\\[ u = u_f + x \\cdot u_{fg} \\]\n\\[ h = h_f + x \\cdot h_{fg} \\]\n\\[ s = s_f + x \\cdot s_{fg} \\]',
        },
        {
          type: 'text',
          title: 'Property Diagrams: P-v and T-v Domes',
          content:
            'On **Pressure-Volume (P-v)** and **Temperature-Volume (T-v)** diagrams, the **Vapor Dome** bounded by the saturated liquid line and saturated vapor line connects at the **Critical Point**.\n\n- Above the Critical Point (for water: \\(P_{cr} = 22.06\\text{ MPa}, T_{cr} = 373.95\\,^\\circ\\text{C}\\)), distinct liquid and vapor phases merge into a supercritical fluid state.',
        },
        {
          type: 'code',
          title: 'Calculating Steam Enthalpy from Quality in Python',
          content:
            '# Calculate specific enthalpy of wet steam with quality x = 0.85\n' +
            '# At P = 100 kPa (1 bar): h_f = 417.44 kJ/kg, h_fg = 2258.0 kJ/kg\n\n' +
            'def steam_enthalpy(hf, hfg, quality):\n' +
            '    h = hf + quality * hfg\n' +
            '    return h\n\n' +
            'hf_100kPa = 417.44\n' +
            'hfg_100kPa = 2258.0\n' +
            'x = 0.85\n\n' +
            'h_total = steam_enthalpy(hf_100kPa, hfg_100kPa, x)\n' +
            'print(f"Enthalpy for x = {x}: {h_total:.2f} kJ/kg")',
          language: 'python',
        },
        {
          type: 'quiz',
          title: 'Quick Check: Vapor Quality Value',
          content: 'Quiz',
          quiz: {
            question: 'What is the vapor quality (x) of saturated liquid water before any vapor forms?',
            options: [
              { text: 'x = 0', isCorrect: true },
              { text: 'x = 1', isCorrect: false },
              { text: 'x = 0.5', isCorrect: false },
              { text: 'x = 100', isCorrect: false },
            ],
            explanation: 'Saturated liquid contains 0% vapor by mass, so quality x = 0.',
          },
        },
      ],
      flashcards: [
        { question: 'What is vapor quality (x)?', answer: 'Ratio of vapor mass to total mixture mass (x = m_g / m_total).' },
        { question: 'What formula calculates enthalpy in saturated mixture region?', answer: 'h = h_f + x * h_fg' },
        { question: 'What is the critical point of a substance?', answer: 'The point on property diagrams where saturated liquid and saturated vapor states are identical.' },
      ],
      mcqs: [
        {
          question: 'If water is heated above its boiling point at constant pressure and all liquid has evaporated, what phase state is it in?',
          options: [
            { text: 'Superheated Vapor', isCorrect: true },
            { text: 'Compressed Liquid', isCorrect: false },
            { text: 'Saturated Mixture', isCorrect: false },
            { text: 'Subcooled State', isCorrect: false },
          ],
          explanation: 'Vapor heated beyond saturation temperature at a given pressure enters the superheated vapor state.',
        },
      ],
    },
    {
      title: 'Module 7: Thermodynamic Power & Refrigeration Cycles',
      description: 'Analyze real-world power plants (Rankine Cycle), internal combustion engines (Otto & Diesel), and Refrigeration.',
      contents: [
        {
          type: 'text',
          title: 'Overview of Thermodynamic Cycles',
          content:
            'Engineers harness thermodynamic principles by combining components into closed cycles to generate electricity or pump heat.\n\nKey Categories:\n1. **Vapor Power Cycles**: Rankine Cycle (steam power plants, nuclear plants).\n2. **Gas Power Cycles**: Otto Cycle (gasoline engines), Diesel Cycle, Brayton Cycle (jet engines, gas turbines).\n3. **Refrigeration Cycles**: Vapor-Compression Refrigeration (air conditioners, home refrigerators).',
        },
        {
          type: 'latex',
          title: 'The Ideal Rankine Steam Cycle',
          content:
            'The **Rankine Cycle** is the ideal model for steam thermal power plants:\n\n1. **1 -> 2**: Isentropic Pumping in Pump (Liquid: \\(W_{pump, in} = v_1(P_2 - P_1)\\)).\n2. **2 -> 3**: Isobaric Heat Addition in Boiler (\\(Q_{in} = h_3 - h_2\\)).\n3. **3 -> 4**: Isentropic Expansion in Turbine (\\(W_{turb, out} = h_3 - h_4\\)).\n4. **4 -> 1**: Isobaric Heat Rejection in Condenser (\\(Q_{out} = h_4 - h_1\\)).\n\n\\[ \\eta_{th, Rankine} = \\frac{W_{net}}{Q_{in}} = \\frac{W_{turb, out} - W_{pump, in}}{Q_{in}} \\]',
        },
        {
          type: 'latex',
          title: 'Gas Power Cycles: Otto & Diesel',
          content:
            '- **Otto Cycle (Ideal Spark-Ignition Engine):**\n  - Constant volume heat addition (compression ratio \\(r = V_{max}/V_{min}\\)).\n  \\[ \\eta_{th, Otto} = 1 - \\frac{1}{r^{k-1}} \\]\n\n- **Diesel Cycle (Ideal Compression-Ignition Engine):**\n  - Constant pressure heat addition (cutoff ratio \\(r_c\\)).',
        },
        {
          type: 'code',
          title: 'Calculating Ideal Otto Cycle Efficiency in Python',
          content:
            '# Calculate Otto Cycle efficiency for compression ratio r = 8.5, k = 1.4\n\n' +
            'def otto_efficiency(r, k=1.4):\n' +
            '    return 1.0 - (1.0 / (r ** (k - 1.0)))\n\n' +
            'r = 8.5\n' +
            'eta_otto = otto_efficiency(r)\n' +
            'print(f"Compression Ratio r: {r}")\n' +
            'print(f"Otto Thermal Efficiency: {eta_otto * 100:.2f}%")',
          language: 'python',
        },
        {
          type: 'quiz',
          title: 'Quick Check: Rankine Components',
          content: 'Quiz',
          quiz: {
            question: 'Which component in the Rankine Cycle increases the pressure of liquid water before entering the boiler?',
            options: [
              { text: 'Pump', isCorrect: true },
              { text: 'Turbine', isCorrect: false },
              { text: 'Condenser', isCorrect: false },
              { text: 'Expansion Valve', isCorrect: false },
            ],
            explanation: 'The pump delivers high-pressure liquid water to the boiler with low power consumption.',
          },
        },
      ],
      flashcards: [
        { question: 'What four components make up an ideal Rankine Cycle power plant?', answer: 'Pump, Boiler, Steam Turbine, Condenser.' },
        { question: 'What parameter determines the ideal thermal efficiency of an Otto cycle?', answer: 'Compression ratio r = V_max / V_min (η = 1 - 1 / r^(k-1)).' },
        { question: 'What cycle models modern home refrigerators and air conditioners?', answer: 'Vapor-Compression Refrigeration Cycle.' },
      ],
      mcqs: [
        {
          question: 'In a Vapor-Compression Refrigeration cycle, what component drops refrigerant pressure from high condenser pressure to low evaporator pressure?',
          options: [
            { text: 'Expansion (Throttling) Valve', isCorrect: true },
            { text: 'Compressor', isCorrect: false },
            { text: 'Evaporator', isCorrect: false },
            { text: 'Turbine', isCorrect: false },
          ],
          explanation: 'The expansion valve throttles the high-pressure liquid refrigerant into a cold low-pressure mixture.',
        },
      ],
    },
    {
      title: 'Module 8: Applied Thermodynamics & Exergy (Availability)',
      description: 'Analyze Exergy (Availability), exergy destruction, the Third Law of Thermodynamics, and engineering design principles.',
      contents: [
        {
          type: 'text',
          title: 'Exergy (Work Potential of Energy)',
          content:
            'While the First Law states energy is conserved, energy **quality** degrades during real processes. **Exergy (or Availability)** represents the MAXIMUM theoretical useful work that can be extracted from a system as it comes into equilibrium with its dead state surroundings (\\(P_0 = 1\\text{ atm}, T_0 = 25\\,^\\circ\\text{C}\\)).',
        },
        {
          type: 'latex',
          title: 'Exergy Destruction & Second-Law Efficiency',
          content:
            'According to the Gouy-Stodola theorem, exergy destroyed (\\(X_{destroyed}\\)) is directly proportional to entropy generation:\n\n\\[ X_{destroyed} = T_0 \\cdot S_{gen} \\ge 0 \\]\n\n**Second-Law Efficiency (\\(\\eta_{II}\\)):**\n\\[ \\eta_{II} = \\frac{\\text{Useful Work Output}}{\\text{Maximum Possible Work Output}} = \\frac{\\eta_{th}}{\\eta_{th, Carnot}} \\]',
        },
        {
          type: 'text',
          title: 'The Third Law of Thermodynamics',
          content:
            '**The Third Law of Thermodynamics** states:\n> *The entropy of a pure crystalline substance at absolute zero temperature (0 Kelvin) is exactly equal to zero.*\n\nThis provides an absolute reference datum for measuring absolute entropy (\\(s^0\\)) of substances without arbitrary relative baseline constants.',
        },
        {
          type: 'quiz',
          title: 'Quick Check: Exergy Destruction',
          content: 'Quiz',
          quiz: {
            question: 'What causes Exergy Destruction (lost work potential) in real engineering systems?',
            options: [
              { text: 'Irreversibilities like friction, unrestrained expansion, and heat transfer across finite ΔT', isCorrect: true },
              { text: 'High thermal efficiency', isCorrect: false },
              { text: 'Operating at absolute zero', isCorrect: false },
              { text: 'Using nitrogen gas', isCorrect: false },
            ],
            explanation: 'Exergy destruction is directly equal to T0 * S_gen caused by irreversibilities in real systems.',
          },
        },
      ],
      flashcards: [
        { question: 'What is Exergy (Availability)?', answer: 'The maximum useful work potential of a system relative to a specified dead state environment.' },
        { question: 'What is the Third Law of Thermodynamics?', answer: 'The entropy of a pure crystalline substance at absolute zero temperature (0 K) is zero.' },
        { question: 'What is the Gouy-Stodola theorem for exergy destruction?', answer: 'X_destroyed = T0 * S_gen' },
      ],
      mcqs: [
        {
          question: 'What is the entropy of a pure, perfectly ordered crystal at 0 Kelvin according to the Third Law of Thermodynamics?',
          options: [
            { text: 'Zero (S = 0)', isCorrect: true },
            { text: 'Infinite', isCorrect: false },
            { text: '1.0 J/K', isCorrect: false },
            { text: 'Dependent on mass', isCorrect: false },
          ],
          explanation: 'The Third Law provides absolute zero entropy baseline for perfect crystals at 0 Kelvin.',
        },
      ],
    },
  ],
};

const run = async (): Promise<void> => {
  try {
    await connectDB();

    console.log('Searching for existing Thermodynamics course in database...');
    let existingCourse = await Course.findOne({
      $or: [
        { title: { $regex: /thermodynamics/i } },
        { category: 'Physics', title: { $regex: /thermodynamics/i } },
      ],
    });

    if (existingCourse) {
      console.log(`Found existing course "${existingCourse.title}" (ID: ${existingCourse._id}). Cleaning up old data...`);
      const existingTopics = await Topic.find({ course: existingCourse._id });
      const existingTopicIds = existingTopics.map((t) => t._id);

      await Promise.all([
        Flashcard.deleteMany({ topic: { $in: existingTopicIds } }),
        MCQ.deleteMany({ topic: { $in: existingTopicIds } }),
        Topic.deleteMany({ course: existingCourse._id }),
        Course.deleteOne({ _id: existingCourse._id }),
      ]);
      console.log('Old course data deleted successfully.');
    }

    console.log(`Creating fresh "${thermodynamicsCourseSeed.course.title}" course...`);
    const course = await Course.create(thermodynamicsCourseSeed.course);

    // Create 3 structured Chapters for the curriculum
    const chapters = await Chapter.create([
      {
        course: course._id,
        title: 'Fundamental Concepts & Laws of Thermodynamics',
        description: 'Understand macroscopic state variables, zeroth law, work, heat, and the First Law.',
        order: 0,
      },
      {
        course: course._id,
        title: 'Entropy, Second Law & Heat Engines',
        description: 'Master heat engines, Carnot efficiency, Clausius inequality, and entropy generation.',
        order: 1,
      },
      {
        course: course._id,
        title: 'Pure Substances, Phase Equilibria & Gas Cycles',
        description: 'Explore PVT surfaces, property tables, ideal gas approximations, and power cycles.',
        order: 2,
      },
    ]);

    let totalTopics = 0;
    let totalFlashcards = 0;
    let totalMcqs = 0;

    for (let i = 0; i < thermodynamicsCourseSeed.topics.length; i++) {
      const topicSeed = thermodynamicsCourseSeed.topics[i];
      const chapterId = i < 3 ? chapters[0]._id : i < 6 ? chapters[1]._id : chapters[2]._id;

      const topic = await Topic.create({
        course: course._id,
        chapter: chapterId,
        title: topicSeed.title,
        description: topicSeed.description,
        contents: topicSeed.contents,
        order: i + 1,
        xp: 50,
        isPublished: true,
      });
      totalTopics++;

      if (topicSeed.flashcards.length > 0) {
        await Flashcard.insertMany(topicSeed.flashcards.map((f) => ({ topic: topic._id, question: f.question, answer: f.answer })));
        totalFlashcards += topicSeed.flashcards.length;
      }

      if (topicSeed.mcqs.length > 0) {
        await MCQ.insertMany(topicSeed.mcqs.map((m) => ({ topic: topic._id, question: m.question, options: m.options, explanation: m.explanation })));
        totalMcqs += topicSeed.mcqs.length;
      }
    }

    console.log('\n========================================');
    console.log('Thermodynamics Course seeded successfully!');
    console.log('========================================');
    console.log(`Course Title: ${course.title}`);
    console.log(`Course ID:    ${course._id}`);
    console.log(`Topics:       ${totalTopics}`);
    console.log(`Flashcards:   ${totalFlashcards}`);
    console.log(`MCQs:         ${totalMcqs}`);
    console.log('========================================\n');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error seeding Thermodynamics course:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  run();
}
