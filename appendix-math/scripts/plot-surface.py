import numpy as np
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D

# Regression coefficients
a = 814.403197
b = -59.590438
c = 75.334222
d = 5.241891
e = 1.159864
f = -12.058743

# Throughput function
def T(B, W):
    return a + b*B + c*W + d*(B**2) + e*B*W + f*(W**2)

# Range of values (same region as the benchmark)
B = np.linspace(1, 10, 50)
W = np.linspace(1, 4, 50)

B_grid, W_grid = np.meshgrid(B, W)
T_grid = T(B_grid, W_grid)

# Create figure
fig = plt.figure()
ax = fig.add_subplot(111, projection='3d')

ax.plot_surface(B_grid, W_grid, T_grid)

ax.set_xlabel("Batch Size (B)")
ax.set_ylabel("Worker Count (W)")
ax.set_zlabel("Throughput (records/sec)")
ax.set_title("Throughput Performance Surface")

# Save figure
plt.savefig("./docs/assets/throughput-surface.png", dpi=300)

plt.show()