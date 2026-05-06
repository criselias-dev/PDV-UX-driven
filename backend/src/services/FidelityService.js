// backend/src/services/FidelityService.js
import CustomerRepository from "../repositories/CustomerRepository.js";
import FidelityHistoryRepository from "../repositories/FidelityHistoryRepository.js";

class FidelityService {
  // Regras de fidelização baseadas em pontos acumulados
  static FIDELITY_TIERS = {
    basic: { minPoints: 0, maxPoints: 99, discount: 0 },
    bronze: { minPoints: 100, maxPoints: 299, discount: 2 },
    silver: { minPoints: 300, maxPoints: 499, discount: 5 },
    gold: { minPoints: 500, maxPoints: 999, discount: 8 },
    platinum: { minPoints: 1000, maxPoints: Infinity, discount: 10 }
  };

  // Pontos por real gasto
  static POINTS_PER_REAL = 1;

  // Calcular pontos ganhos em uma compra
  calculatePointsEarned(totalAmount) {
    return Math.floor(totalAmount * this.constructor.POINTS_PER_REAL);
  }

  // Obter tier atual baseado nos pontos
  getTierByPoints(points) {
    for (const [tier, config] of Object.entries(this.constructor.FIDELITY_TIERS)) {
      if (points >= config.minPoints && points <= config.maxPoints) {
        return { tier, ...config };
      }
    }
    return { tier: 'basic', ...this.constructor.FIDELITY_TIERS.basic };
  }

  // Obter desconto baseado no tier
  getDiscountByTier(tier) {
    return this.constructor.FIDELITY_TIERS[tier]?.discount || 0;
  }

  // Atualizar pontos do cliente após uma compra
  async addPurchasePoints(customerCpf, saleId, totalAmount) {
    const pointsEarned = this.calculatePointsEarned(totalAmount);

    if (pointsEarned <= 0) return;

    // Buscar cliente atual
    const customer = await CustomerRepository.findByCPF(customerCpf);
    if (!customer) {
      throw new Error("Cliente não encontrado");
    }

    const newPoints = customer.points + pointsEarned;

    // Atualizar pontos do cliente
    await CustomerRepository.updatePoints(customerCpf, newPoints);

    // Registrar no histórico
    await FidelityHistoryRepository.create({
      customer_cpf: customerCpf,
      sale_id: saleId,
      points: pointsEarned,
      reason: `Compra realizada - R$ ${totalAmount.toFixed(2)}`
    });

    // Verificar se houve upgrade de tier
    const oldTier = this.getTierByPoints(customer.points);
    const newTier = this.getTierByPoints(newPoints);

    if (oldTier.tier !== newTier.tier) {
      await this.upgradeTier(customerCpf, newTier.tier);
    }

    return {
      pointsEarned,
      newTotalPoints: newPoints,
      newTier: newTier.tier,
      tierUpgraded: oldTier.tier !== newTier.tier
    };
  }

  // Upgrade de tier do cliente
  async upgradeTier(customerCpf, newTier) {
    await CustomerRepository.updateFidelityStatus(customerCpf, newTier);

    // Registrar upgrade no histórico
    await FidelityHistoryRepository.create({
      customer_cpf: customerCpf,
      points: 0,
      reason: `Upgrade para tier ${newTier}`
    });

    console.log(`Cliente ${customerCpf} upgraded para ${newTier}`);
  }

  // Obter informações completas de fidelização do cliente
  async getFidelityInfo(customerCpf) {
    const customer = await CustomerRepository.findByCPF(customerCpf);
    if (!customer) {
      throw new Error("Cliente não encontrado");
    }

    const tierInfo = this.getTierByPoints(customer.points);
    const nextTier = this.getNextTier(customer.points);

    // Buscar histórico recente
    const history = await FidelityHistoryRepository.findByCustomer(customerCpf, 10);

    return {
      cpf: customer.cpf,
      name: customer.name,
      points: customer.points,
      tier: tierInfo.tier,
      discount: tierInfo.discount,
      nextTier: nextTier ? {
        tier: nextTier.tier,
        pointsNeeded: nextTier.minPoints - customer.points,
        discount: nextTier.discount
      } : null,
      history: history
    };
  }

  // Obter próximo tier possível
  getNextTier(currentPoints) {
    const tiers = Object.entries(this.constructor.FIDELITY_TIERS);
    for (let i = 0; i < tiers.length - 1; i++) {
      const [tier, config] = tiers[i];
      if (currentPoints >= config.minPoints && currentPoints < config.maxPoints) {
        return { tier: tiers[i + 1][0], ...tiers[i + 1][1] };
      }
    }
    return null; // Já está no tier máximo
  }

  // Resetar pontos (para manutenção/admin)
  async resetPoints(customerCpf) {
    await CustomerRepository.updatePoints(customerCpf, 0);
    await CustomerRepository.updateFidelityStatus(customerCpf, 'basic');

    await FidelityHistoryRepository.create({
      customer_cpf: customerCpf,
      points: 0,
      reason: "Reset de pontos - manutenção"
    });
  }
}

export default new FidelityService();