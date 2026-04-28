export const isThisWeek = (dateStr: string) => {
  const date = new Date(dateStr + 'T00:00:00');
  const now = new Date();

  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0,0,0,0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23,59,59,999);

  return date >= startOfWeek && date <= endOfWeek;
};

export const getNextBookingDisplay = (bookings: any[]) => {
  const futureBookings = bookings
    .filter(b => b.status === 'booked' || b.status === 'confirmed')
    .sort((a, b) => {
      const dateA = new Date(a.datetime?.toDate?.() || a.date);
      const dateB = new Date(b.datetime?.toDate?.() || b.date);
      return dateA.getTime() - dateB.getTime();
    });

  if (futureBookings.length === 0) {
    return { value: "Nenhuma", sub: "Agendar agora →", hasLink: true };
  }

  const next = futureBookings[0];
  const bookingDate = new Date(next.datetime?.toDate?.() || next.date);

  return {
    value: bookingDate.toLocaleString('pt-BR'),
    sub: "Ver agenda →",
    hasLink: true
  };
};

export const getWeeklyBookings = (bookings: any[]) => {
  return bookings.filter(booking => isThisWeek(booking.date));
};

export const getUpcomingBookings = (bookings: any[]) => {
  const today = new Date().toISOString().split('T')[0];
  return bookings.filter(b => 
    (b.status === 'booked' || b.status === 'confirmed') && 
    b.date >= today
  );
};

export const getPastBookings = (bookings: any[]) => {
  const today = new Date().toISOString().split('T')[0];
  return bookings.filter(b => 
    b.status === 'completed' || b.date < today
  );
};
