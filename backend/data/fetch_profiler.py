import pstats

# Create a Stats object
p = pstats.Stats('profile_stats')

# Sort by cumulative time and print the first ten lines
p.sort_stats('cumulative').print_stats(10)