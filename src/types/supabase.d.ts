declare global {
  var supabase: {
    from: jest.Mock;
    [key: string]: any;
  };
}

export {};