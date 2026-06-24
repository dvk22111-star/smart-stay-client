import React from 'react';

type User = { name: string | null; email: string | null }
const Home: React.FC = () => {
  const [flow, setFlow] = React.useState<'info' | 'offers' | 'groupOffers' | 'sendItinerary' | null>(null)
  const [user, setUser] = React.useState<User>({ name: 'דנה', email: '' })    }  