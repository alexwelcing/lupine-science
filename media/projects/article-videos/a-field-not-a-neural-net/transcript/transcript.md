# A Field, Not a Neural Net — Transcript

Source audio: `/home/alex/Dev/lupine/lupine-science/media/projects/article-videos/a-field-not-a-neural-net/narration-ana-final.wav`

## Transcript

**00:00:00.000–00:00:03.380**  
Okay, so Google DeepMind predicted 2.2 million crystals.

**00:00:04.260–00:00:04.440**  
Huge.

**00:00:05.240–00:00:09.860**  
But by late 2023, only 736 had been independently synthesized.

**00:00:10.500–00:00:12.880**  
The usual response is: build a bigger neural net.

**00:00:13.580–00:00:15.060**  
What if that is solving the wrong problem?

**00:00:15.700–00:00:20.140**  
Universal machine-learning potentials are already fast and pretty accurate for tidy bulk crystals.

**00:00:20.860–00:00:26.620**  
But real materials work at vacancies, surfaces, and transition states—places where atoms have fewer neighbors.

**00:00:27.340–00:00:31.900**  
There, errors jump, and ion-migration barriers can be underestimated by more than 60 percent.

**00:00:32.580–00:00:35.280**  
Here is the twist: that wrongness is not random.

**00:00:35.980–00:00:36.680**  
It has a shape.

**00:00:37.480–00:00:43.140**  
Lupine measures an environment error field based on coordination number—basically, how many neighboring atoms each atom has.

**00:00:43.860–00:00:44.920**  
No second neural net.

**00:00:45.660–00:00:46.700**  
No per-system retraining.

**00:00:47.460–00:00:51.740**  
Three standard measurements anchor the curve: two surface energies and one vacancy energy.

**00:00:52.540–00:00:54.600**  
Bulk coordination is fixed at zero error.

**00:00:55.130–00:00:58.660**  
Then the field predicts a fourth surface—the one-ten facet—blind.

**00:00:59.420–00:01:05.220**  
Across 36 model-and-material combinations, predicted and measured errors correlate at zero point nine oh six.

**00:01:06.080–00:01:11.580**  
Flip that field, add it beside the existing model, and under-coordinated structures move back toward reference energies.

**00:01:12.360–00:01:15.580**  
The forces are analytic, so simulations stay physically consistent.

**00:01:16.360–00:01:22.920**  
In tests, nickel surface error dropped from 9.7 to 1.5 percent, while bulk lattice constants stayed unchanged.

**00:01:23.660–00:01:27.060**  
And this layer does something most AI pipelines cannot: it can say no.

**00:01:27.760–00:01:34.540**  
Lean four proofs check every quantitative claim and flag ranking inversions, already-converged cases, or physics outside the field’s domain.

**00:01:35.280–00:01:39.520**  
One proof even caught a rounding tie and corrected “27 improvements” to 26.

**00:01:40.220–00:01:48.120**  
That matters for battery ion hops, carbon-capture frameworks, ammonia catalysts, and perovskite stability—all controlled by under-coordinated defects.

**00:01:48.840–00:01:50.940**  
So the goal is not more confident predictions.

**00:01:51.780–00:01:56.600**  
It is fast predictions with measured corrections, certified boundaries, and a provable reason to stop.
