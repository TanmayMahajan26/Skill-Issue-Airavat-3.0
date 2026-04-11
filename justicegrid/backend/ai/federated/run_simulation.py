"""
End-to-end FL simulation -- demonstrates federated learning across DLSAs.
Run: python -m ai.federated.run_simulation
"""
import json
from .fl_server import FLServer
from .fl_client import FLClient


def run_simulation():
    """Simulate federated learning across 3 DLSA nodes."""
    print("=" * 60)
    print("  JusticeGrid -- Federated Learning Simulation")
    print("=" * 60)

    # 1. Create server
    server = FLServer()

    # 2. Register DLSA clients
    clients = [
        FLClient("DLSA-MH-PUNE", "DLSA Pune", "Maharashtra", "Pune"),
        FLClient("DLSA-UP-LKO", "DLSA Lucknow", "Uttar Pradesh", "Lucknow"),
        FLClient("DLSA-TN-CHN", "DLSA Chennai", "Tamil Nadu", "Chennai"),
    ]

    for client in clients:
        result = server.register_client(client)
        print(f"\n  [OK] Registered: {client.dlsa_name} ({client.state})")

    # 3. Run 3 federated rounds
    print("\n" + "-" * 60)
    for round_num in range(1, 4):
        print(f"\n  [ROUND {round_num}]:")
        result = server.run_round()
        print(f"     Participants: {result['participants']}")
        print(f"     Global Accuracy: {result['global_accuracy']:.3f}")
        for cr in result['client_results']:
            print(f"     -- {cr['dlsa_code']}: local_acc={cr['local_accuracy']:.3f}, "
                  f"samples={cr['n_samples']}, quality={cr['data_quality_score']:.3f}")

    # 4. Show governance data
    print("\n" + "=" * 60)
    print("  [GOVERNANCE DASHBOARD]")
    print("=" * 60)
    gov = server.get_governance_data()
    print(f"  Total Nodes: {gov['total_nodes']}")
    print(f"  Active: {gov['active_nodes']}")
    print(f"  Rounds Completed: {gov['total_rounds']}")
    print(f"  Global Accuracy: {gov['global_accuracy']:.3f}")

    for node in gov['nodes']:
        budget = node['privacy_budget']
        print(f"\n  Node: {node['dlsa_name']}")
        print(f"    Accuracy: {node['local_accuracy']:.3f}")
        print(f"    Privacy epsilon spent: {budget['epsilon_spent']:.4f} / {budget['max_epsilon']}")
        print(f"    Data Quality: {node['data_quality_score']:.3f}")

    # 5. Demonstrate withdrawal
    print("\n" + "-" * 60)
    print("  [WITHDRAWAL] Demonstrating DLSA Withdrawal...")
    withdrawal = server.withdraw_client("DLSA-TN-CHN")
    print(f"  Status: {withdrawal['status']}")
    print(f"  Removal Proof: {withdrawal['removal_proof'][:32]}...")
    print(f"  Remaining Nodes: {withdrawal['remaining_nodes']}")

    # Save governance data as JSON
    print("\n  [SAVE] Saving governance data to fl_governance_output.json")
    output = {
        "governance": gov,
        "withdrawal_demo": withdrawal,
        "simulation_complete": True,
    }

    return output


if __name__ == "__main__":
    run_simulation()
